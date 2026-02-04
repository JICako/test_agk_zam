document.addEventListener('DOMContentLoaded', function() {
    // DOM элементтері
    const testSelectionScreen = document.getElementById('test-selection-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');
    const lawCards = document.querySelectorAll('.law-card');
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const restartTestBtn = document.getElementById('restart-test-btn');
    const newTestBtn = document.getElementById('new-test-btn');
    
    // Тест
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const progressFill = document.querySelector('.progress-fill');
    const currentLawElement = document.getElementById('current-law');
    const resultsLawName = document.getElementById('results-law-name');
    
    // Нәтижелер
    const scorePercentage = document.getElementById('score-percentage');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const totalCount = document.getElementById('total-count');
    const resultsList = document.getElementById('results-list');
    
    // Состояние
    let currentTest = null;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let testResults = [];
    let selectedLaw = 1;
    let allQuestionsData = null;
    
    // Инициализация
    initializeApp();
    
    function initializeApp() {
        // Загружаем вопросы
        loadQuestions();
        
        // Добавляем обработчики событий
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                selectedLaw = parseInt(card.getAttribute('data-law'));
                startTest(selectedLaw);
            });
        });
        
        backToSelectionBtn.addEventListener('click', () => {
            showScreen(testSelectionScreen);
        });
        
        nextQuestionBtn.addEventListener('click', goToNextQuestion);
        
        restartTestBtn.addEventListener('click', () => {
            startTest(selectedLaw);
        });
        
        newTestBtn.addEventListener('click', () => {
            showScreen(testSelectionScreen);
        });
        
        // Показываем экран тестов
        showScreen(testSelectionScreen);
    }
    
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки вопросов: ${response.status}`);
            }
            
            allQuestionsData = await response.json();
            console.log('Вопросы успешно загружены:', allQuestionsData.length);
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            // В случае ошибки создаем демо-вопросы
            allQuestionsData = generateDemoQuestions();
        }
    }
    
    function startTest(lawNumber) {
        if (!allQuestionsData) {
            alert('Вопросы еще загружаются. Пожалуйста, подождите...');
            return;
        }
        
        // Фильтруем вопросы по выбранному закону
        currentQuestions = allQuestionsData.filter(q => q.law === lawNumber);
        
        // Если вопросов нет, используем демо-вопросы для этого закона
        if (currentQuestions.length === 0) {
            const demoQuestions = generateDemoQuestions();
            currentQuestions = demoQuestions.filter(q => q.law === lawNumber);
        }
        
        // Перемешиваем вопросы и ограничиваем до 10
        shuffleArray(currentQuestions);
        currentQuestions = currentQuestions.slice(0, 50);
        
        // Перемешиваем варианты ответов в каждом вопросе
        currentQuestions.forEach(question => {
            question.allAnswers = shuffleArray([
                question.correctAnswer,
                ...question.incorrectAnswers
            ]);
        });
        
        // Сбрасываем состояние теста
        currentQuestionIndex = 0;
        userAnswers = [];
        testResults = [];
        
        // Обновляем интерфейс
        currentLawElement.textContent = `Закон ${lawNumber}`;
        resultsLawName.textContent = `Закон ${lawNumber}`;
        totalQuestionsElement.textContent = currentQuestions.length;
        
        // Показываем экран тестирования
        showScreen(testScreen);
        
        // Загружаем первый вопрос
        loadQuestion();
    }
    
    function loadQuestion() {
        if (currentQuestionIndex >= currentQuestions.length) {
            showResults();
            return;
        }
        
        const question = currentQuestions[currentQuestionIndex];
        
        // Обновляем текст вопроса
        questionText.textContent = question.question;
        
        // Обновляем номер вопроса
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        
        // Обновляем прогресс
        const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        // Очищаем контейнер с вариантами ответов
        optionsContainer.innerHTML = '';
        
        // Создаем кнопки для вариантов ответов
        question.allAnswers.forEach((answer, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${answer}</div>
            `;
            
            optionBtn.addEventListener('click', () => {
                selectAnswer(answer, question.correctAnswer);
            });
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // Деактивируем кнопку "Следующий вопрос"
        nextQuestionBtn.disabled = true;
    }
    
    function selectAnswer(selectedAnswer, correctAnswer) {
        // Записываем ответ пользователя
        userAnswers[currentQuestionIndex] = selectedAnswer;
        
        // Получаем все кнопки вариантов ответов
        const optionButtons = document.querySelectorAll('.option-btn');
        
        // Отключаем все кнопки
        optionButtons.forEach(btn => {
            btn.disabled = true;
            
            // Находим текст ответа в кнопке
            const answerText = btn.querySelector('.option-text').textContent;
            
            // Проверяем, является ли этот ответ правильным
            if (answerText === correctAnswer) {
                btn.classList.add('correct');
            } else if (answerText === selectedAnswer && selectedAnswer !== correctAnswer) {
                btn.classList.add('incorrect');
            }
        });
        
        // Активируем кнопку "Следующий вопрос"
        nextQuestionBtn.disabled = false;
        
        // Сохраняем результат для текущего вопроса
        testResults[currentQuestionIndex] = {
            question: currentQuestions[currentQuestionIndex].question,
            userAnswer: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer
        };
    }
    
    function goToNextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }
    
    function showResults() {
        // Подсчет результатов
        const correctAnswers = testResults.filter(r => r.isCorrect).length;
        const totalQuestions = testResults.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Обновление статистики
        scorePercentage.textContent = `${score}%`;
        correctCount.textContent = correctAnswers;
        incorrectCount.textContent = totalQuestions - correctAnswers;
        totalCount.textContent = totalQuestions;
        
        // Анимация круговой диаграммы
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.background = `conic-gradient(#3498db ${score}%, #ecf0f1 ${score}%)`;
        
        // Отображение детализации ответов
        resultsList.innerHTML = '';
        
        testResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            resultItem.innerHTML = `
                <div class="result-question">${index + 1}. ${result.question}</div>
                <div class="result-answer">
                    <div class="user-answer">
                        <div class="answer-label">Ваш ответ:</div>
                        <div class="answer-text">${result.userAnswer}</div>
                    </div>
                    ${!result.isCorrect ? `
                    <div class="correct-answer">
                        <div class="answer-label">Правильный ответ:</div>
                        <div class="answer-text">${result.correctAnswer}</div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            resultsList.appendChild(resultItem);
        });
        
        // Показываем экран результатов
        showScreen(resultsScreen);
    }
    
    // Вспомогательные функции
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    function showScreen(screen) {
        // Скрыть все экраны
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        // Показать выбранный экран
        screen.classList.add('active');
    }
    
    function generateDemoQuestions() {
        // Демо-вопросы для случая, если файл questions.json недоступен
        return [
            // Закон 1
            {
                law: 1,
                question: "Что является основным принципом первого закона?",
                correctAnswer: "Равенство всех перед законом",
                incorrectAnswers: [
                    "Приоритет государства над личностью",
                    "Ограничение прав граждан",
                    "Свобода от ответственности"
                ]
            },
            {
                law: 1,
                question: "С какого момента закон вступает в силу?",
                correctAnswer: "После официального опубликования",
                incorrectAnswers: [
                    "С момента подписания",
                    "Через месяц после принятия",
                    "После рассмотрения конституционным судом"
                ]
            },
            {
                law: 1,
                question: "Кто является субъектом права по первому закону?",
                correctAnswer: "Физические и юридические лица",
                incorrectAnswers: [
                    "Только граждане государства",
                    "Только государственные органы",
                    "Только совершеннолетние"
                ]
            },
            {
                law: 1,
                question: "Что гарантирует первый закон?",
                correctAnswer: "Защиту прав и свобод",
                incorrectAnswers: [
                    "Бесплатное жилье",
                    "Пожизненную пенсию",
                    "Освобождение от налогов"
                ]
            },
            {
                law: 1,
                question: "Какой орган осуществляет правосудие?",
                correctAnswer: "Суд",
                incorrectAnswers: [
                    "Правительство",
                    "Парламент",
                    "Президент"
                ]
            },
            // Закон 2
            {
                law: 2,
                question: "Что является обязанностью гражданина по второму закону?",
                correctAnswer: "Соблюдение законов",
                incorrectAnswers: [
                    "Участие в выборах",
                    "Служба в армии",
                    "Уплата налогов"
                ]
            },
            {
                law: 2,
                question: "Какое право гарантирует второй закон?",
                correctAnswer: "Право на труд",
                incorrectAnswers: [
                    "Право на бесплатное образование",
                    "Право на жилье",
                    "Право на отдых за границей"
                ]
            },
            {
                law: 2,
                question: "С какого возраста наступает полная дееспособность?",
                correctAnswer: "С 18 лет",
                incorrectAnswers: [
                    "С 16 лет",
                    "С 21 года",
                    "С 25 лет"
                ]
            },
            {
                law: 2,
                question: "Что защищает второй закон?",
                correctAnswer: "Трудовые права граждан",
                incorrectAnswers: [
                    "Права животных",
                    "Авторские права",
                    "Права иностранцев"
                ]
            },
            {
                law: 2,
                question: "Какой документ подтверждает личность?",
                correctAnswer: "Паспорт",
                incorrectAnswers: [
                    "Водительские права",
                    "Свидетельство о рождении",
                    "Трудовая книжка"
                ]
            },
            // Закон 3
            {
                law: 3,
                question: "Что регулирует третий закон?",
                correctAnswer: "Процессуальные нормы",
                incorrectAnswers: [
                    "Уголовное право",
                    "Гражданское право",
                    "Административное право"
                ]
            },
            {
                law: 3,
                question: "Сколько стадий в судебном процессе?",
                correctAnswer: "Три",
                incorrectAnswers: [
                    "Две",
                    "Четыре",
                    "Пять"
                ]
            },
            {
                law: 3,
                question: "Кто представляет сторону защиты в суде?",
                correctAnswer: "Адвокат",
                incorrectAnswers: [
                    "Прокурор",
                    "Судья",
                    "Секретарь суда"
                ]
            },
            {
                law: 3,
                question: "Что такое апелляция?",
                correctAnswer: "Обжалование решения суда",
                incorrectAnswers: [
                    "Первая инстанция",
                    "Исполнение решения",
                    "Предварительное следствие"
                ]
            },
            {
                law: 3,
                question: "Сколько времени дается на подачу апелляции?",
                correctAnswer: "Месяц",
                incorrectAnswers: [
                    "Неделя",
                    "Два месяца",
                    "Три месяца"
                ]
            },
            // Закон 4
            {
                law: 4,
                question: "Что относится к административным правонарушениям?",
                correctAnswer: "Нарушение правил дорожного движения",
                incorrectAnswers: [
                    "Кража",
                    "Убийство",
                    "Мошенничество"
                ]
            },
            {
                law: 4,
                question: "Кто рассматривает административные дела?",
                correctAnswer: "Административная комиссия",
                incorrectAnswers: [
                    "Уголовный суд",
                    "Арбитражный суд",
                    "Конституционный суд"
                ]
            },
            {
                law: 4,
                question: "Какой максимальный штраф по административному кодексу?",
                correctAnswer: "5000 рублей",
                incorrectAnswers: [
                    "1000 рублей",
                    "10000 рублей",
                    "50000 рублей"
                ]
            },
            {
                law: 4,
                question: "Что такое административный арест?",
                correctAnswer: "Изоляция от общества на срок до 15 суток",
                incorrectAnswers: [
                    "Домашний арест",
                    "Пожизненное заключение",
                    "Исправительные работы"
                ]
            },
            {
                law: 4,
                question: "Кто имеет право составлять протокол об административном правонарушении?",
                correctAnswer: "Сотрудник полиции",
                incorrectAnswers: [
                    "Любой гражданин",
                    "Судья",
                    "Адвокат"
                ]
            },
            // Закон 5
            {
                law: 5,
                question: "Что регулирует пятый закон?",
                correctAnswer: "Заключительные положения",
                incorrectAnswers: [
                    "Основные права",
                    "Процессуальные нормы",
                    "Административные отношения"
                ]
            },
            {
                law: 5,
                question: "Когда закон считается утратившим силу?",
                correctAnswer: "После принятия нового закона",
                incorrectAnswers: [
                    "Через 10 лет после принятия",
                    "После изменения конституции",
                    "После решения суда"
                ]
            },
            {
                law: 5,
                question: "Что такое переходные положения?",
                correctAnswer: "Нормы, действующие до полного вступления закона в силу",
                incorrectAnswers: [
                    "Основные принципы закона",
                    "Поправки к закону",
                    "Комментарии к закону"
                ]
            },
            {
                law: 5,
                question: "Кто имеет право вносить изменения в закон?",
                correctAnswer: "Законодательный орган",
                incorrectAnswers: [
                    "Президент",
                    "Правительство",
                    "Конституционный суд"
                ]
            },
            {
                law: 5,
                question: "Какой документ является официальным толкованием закона?",
                correctAnswer: "Постановление пленума верховного суда",
                incorrectAnswers: [
                    "Комментарий юриста",
                    "Научная статья",
                    "Учебник по праву"
                ]
            }
        ];
    }
});