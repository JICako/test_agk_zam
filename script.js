document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 10; // Можно изменить на 50
    
    // Элементы DOM
    const screens = {
        selection: document.getElementById('test-selection-screen'),
        test: document.getElementById('test-screen'),
        results: document.getElementById('results-screen')
    };
    
    const buttons = {
        back: document.getElementById('back-to-selection'),
        next: document.getElementById('next-question-btn'),
        restart: document.getElementById('restart-test-btn'),
        newTest: document.getElementById('new-test-btn'),
        langRu: document.getElementById('lang-ru'),
        langKz: document.getElementById('lang-kz')
    };
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const progressFill = document.querySelector('.progress-fill');
    const currentLawElement = document.getElementById('current-law');
    const resultsLawName = document.getElementById('results-law-name');
    const scorePercentage = document.getElementById('score-percentage');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const totalCount = document.getElementById('total-count');
    const resultsList = document.getElementById('results-list');
    const lawCards = document.querySelectorAll('.law-card');
    
    // Состояние приложения
    const state = {
        currentQuestions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        testResults: [],
        selectedLaw: 1,
        questionsByLaw: { 1: [], 2: [], 3: [], 4: [], 5: [] },
        isLoading: false,
        language: localStorage.getItem('test_language') || 'ru',
        totalQuestionsLoaded: 0
    };
    
    // Словари переводов
    const translations = {
        'ru': {
            'title': 'Тестирование по законам',
            'subtitle': 'Проверьте свои знания основных законов',
            'choose_law': 'Выберите закон для тестирования',
            'law1_title': 'Первый закон',
            'law1_desc': 'Основные положения и принципы',
            'law2_title': 'Второй закон',
            'law2_desc': 'Права и обязанности',
            'law3_title': 'Третий закон',
            'law3_desc': 'Процессуальные нормы',
            'law4_title': 'Четвертый закон',
            'law4_desc': 'Административные положения',
            'law5_title': 'Пятый закон',
            'law5_desc': 'Заключительные положения',
            'instructions': 'Инструкция',
            'instruction1': 'Выберите один из пяти законов для тестирования',
            'instruction2': 'Каждый тест содержит случайные вопросы без повторений',
            'instruction3': 'В каждом вопросе нужно выбрать один правильный ответ',
            'instruction4': 'После ответа вы увидите правильный вариант',
            'instruction5': 'В конце теста вы получите детальный результат',
            'question': 'Вопрос',
            'of': 'из',
            'law': 'Закон',
            'back': 'Назад',
            'next_question': 'Следующий вопрос',
            'results': 'Результаты тестирования',
            'correct_answers': 'правильных ответов',
            'correct_count': 'Правильных ответов',
            'incorrect_count': 'Неправильных ответов',
            'total_questions': 'Всего вопросов',
            'results_details': 'Детализация ответов',
            'restart_test': 'Пройти тест заново',
            'choose_another': 'Выбрать другой закон',
            'copyright': '© 2023 Тестирование по законам',
            'your_answer': 'Ваш ответ:',
            'correct_answer': 'Правильный ответ:',
            'loading': 'Загрузка вопросов...',
            'loaded': 'Загружено',
            'questions': 'вопросов',
            'error_loading': 'Ошибка загрузки вопросов',
            'no_questions': 'Для этого закона нет вопросов',
            'choose_another_law': 'Пожалуйста, выберите другой закон.',
            'available': 'доступно',
            'test_will_contain': 'Тест будет содержать все доступные вопросы.'
        },
        'kz': {
            'title': 'Заңдар бойынша тестілеу',
            'subtitle': 'Негізгі заңдар бойынша біліміңізді тексеріңіз',
            'choose_law': 'Тестілеу үшін заңды таңдаңыз',
            'law1_title': 'Бірінші заң',
            'law1_desc': 'Негізгі ережелер мен қағидаттар',
            'law2_title': 'Екінші заң',
            'law2_desc': 'Құқықтар мен міндеттер',
            'law3_title': 'Үшінші заң',
            'law3_desc': 'Процессуалдық ережелер',
            'law4_title': 'Төртінші заң',
            'law4_desc': 'Әкімшілік ережелер',
            'law5_title': 'Бесінші заң',
            'law5_desc': 'Қорытынды ережелер',
            'instructions': 'Нұсқаулық',
            'instruction1': 'Тестілеу үшін бес заңның бірін таңдаңыз',
            'instruction2': 'Әрбір тестте қайталанбайтын кездейсоқ сұрақтар бар',
            'instruction3': 'Әрбір сұрақта бір дұрыс жауапты таңдау керек',
            'instruction4': 'Жауап бергеннен кейін дұрыс нұсқаны көресіз',
            'instruction5': 'Тест аяқталғаннан кейін толық нәтиже аласыз',
            'question': 'Сұрақ',
            'of': '-дан',
            'law': 'Заң',
            'back': 'Артқа',
            'next_question': 'Келесі сұрақ',
            'results': 'Тестілеу нәтижелері',
            'correct_answers': 'дұрыс жауап',
            'correct_count': 'Дұрыс жауаптар',
            'incorrect_count': 'Қате жауаптар',
            'total_questions': 'Барлық сұрақтар',
            'results_details': 'Жауаптардың егжей-тегжейі',
            'restart_test': 'Тестті қайта өту',
            'choose_another': 'Басқа заңды таңдау',
            'copyright': '© 2023 Заңдар бойынша тестілеу',
            'your_answer': 'Сіздің жауабыңыз:',
            'correct_answer': 'Дұрыс жауап:',
            'loading': 'Сұрақтар жүктелуде...',
            'loaded': 'Жүктелді',
            'questions': 'сұрақ',
            'error_loading': 'Сұрақтарды жүктеу кезінде қате пайда болды',
            'no_questions': 'Бұл заң үшін сұрақтар жоқ',
            'choose_another_law': 'Басқа заңды таңдаңыз.',
            'available': 'қолжетімді',
            'test_will_contain': 'Тест барлық қолжетімді сұрақтарды қамтиды.'
        }
    };
    
    // Инициализация приложения
    function init() {
        setupEventListeners();
        updateLanguageButtons();
        updateInterfaceTexts();
        loadQuestions();
        showScreen(screens.selection);
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Карточки законов
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                if (state.isLoading) {
                    alert(getTranslation('loading'));
                    return;
                }
                
                if (state.totalQuestionsLoaded === 0) {
                    alert(getTranslation('error_loading'));
                    return;
                }
                
                state.selectedLaw = parseInt(card.getAttribute('data-law'));
                startTest(state.selectedLaw);
            });
        });
        
        // Кнопки навигации
        if (buttons.back) buttons.back.addEventListener('click', () => showScreen(screens.selection));
        if (buttons.next) buttons.next.addEventListener('click', goToNextQuestion);
        if (buttons.restart) buttons.restart.addEventListener('click', () => startTest(state.selectedLaw));
        if (buttons.newTest) buttons.newTest.addEventListener('click', () => showScreen(screens.selection));
        
        // Переключение языка
        if (buttons.langRu) {
            buttons.langRu.addEventListener('click', () => {
                if (state.language !== 'ru') switchLanguage('ru');
            });
        }
        
        if (buttons.langKz) {
            buttons.langKz.addEventListener('click', () => {
                if (state.language !== 'kz') switchLanguage('kz');
            });
        }
    }
    
    // Загрузка вопросов из JSON файла
    async function loadQuestions() {
        state.isLoading = true;
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> ${getTranslation('loading')}</p>`;
        
        const lawSelection = document.querySelector('.law-selection');
        if (lawSelection.querySelector('.loading-indicator')) {
            lawSelection.querySelector('.loading-indicator').remove();
        }
        lawSelection.appendChild(loadingIndicator);
        
        try {
            // Пытаемся загрузить вопросы для текущего языка
            const filename = `questions${state.language}.json`;
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            const questionsData = await response.json();
            
            if (!Array.isArray(questionsData)) {
                throw new Error('Некорректный формат JSON файла');
            }
            
            // Группируем вопросы по законам
            state.questionsByLaw = groupQuestionsByLaw(questionsData);
            state.totalQuestionsLoaded = questionsData.length;
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об успешной загрузке
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            
            let totalByLaw = 0;
            for (let law in state.questionsByLaw) {
                totalByLaw += state.questionsByLaw[law].length;
            }
            
            successMessage.innerHTML = `<p><i class="fas fa-check-circle"></i> ${getTranslation('loaded')} ${totalByLaw} ${getTranslation('questions')}</p>`;
            lawSelection.appendChild(successMessage);
            
            // Через 3 секунды убираем сообщение
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 3000);
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> ${getTranslation('error_loading')}</p>
                <p>${error.message}</p>
                <p>Создайте файл questions_${state.language}.json с вопросами</p>
                <p>Пример структуры файла смотрите в инструкции</p>
            `;
            lawSelection.appendChild(errorMessage);
            
            // Создаем демо-вопросы для тестирования
            createDemoQuestions();
        } finally {
            state.isLoading = false;
        }
    }
    
    // Создание демо-вопросов для тестирования
    function createDemoQuestions() {
        const demoQuestions = [];
        
        for (let law = 1; law <= 5; law++) {
            for (let i = 1; i <= 20; i++) {
                demoQuestions.push({
                    law: law,
                    question: `[${state.language === 'ru' ? 'Демо' : 'Демо'}] Вопрос ${i} для закона ${law}`,
                    correctAnswer: `Правильный ответ ${i}`,
                    incorrectAnswers: [
                        `Неправильный ответ ${i}.1`,
                        `Неправильный ответ ${i}.2`,
                        `Неправильный ответ ${i}.3`
                    ]
                });
            }
        }
        
        state.questionsByLaw = groupQuestionsByLaw(demoQuestions);
        state.totalQuestionsLoaded = demoQuestions.length;
    }
    
    // Группировка вопросов по законам
    function groupQuestionsByLaw(questions) {
        const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        
        if (Array.isArray(questions)) {
            questions.forEach(question => {
                const law = parseInt(question.law);
                if (law >= 1 && law <= 5 && question.question && question.correctAnswer && question.incorrectAnswers) {
                    grouped[law].push(question);
                }
            });
        }
        
        return grouped;
    }
    
    // Начало теста
    function startTest(lawNumber) {
        const allLawQuestions = state.questionsByLaw[lawNumber] || [];
        
        if (allLawQuestions.length === 0) {
            alert(`${getTranslation('no_questions')} ${getTranslation('choose_another_law')}`);
            return;
        }
        
        // Определяем количество вопросов для теста
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            alert(`${getTranslation('law')} ${lawNumber} ${getTranslation('available')} ${allLawQuestions.length} ${getTranslation('questions')}. ${getTranslation('test_will_contain')}`);
        }
        
        // Выбираем случайные вопросы без повторений
        state.currentQuestions = getRandomQuestions(allLawQuestions, questionsToTake);
        
        // Перемешиваем варианты ответов в каждом вопросе
        state.currentQuestions.forEach(question => {
            if (question.correctAnswer && question.incorrectAnswers) {
                question.allAnswers = shuffleArray([
                    question.correctAnswer,
                    ...question.incorrectAnswers
                ]);
            }
        });
        
        // Сбрасываем состояние теста
        state.currentQuestionIndex = 0;
        state.userAnswers = [];
        state.testResults = [];
        state.selectedLaw = lawNumber;
        
        // Обновляем интерфейс
        if (currentLawElement) {
            currentLawElement.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        }
        
        if (resultsLawName) {
            resultsLawName.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        }
        
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = state.currentQuestions.length;
        }
        
        // Показываем экран теста
        showScreen(screens.test);
        
        // Загружаем первый вопрос
        loadQuestion();
    }
    
    // Выбор случайных вопросов без повторений
    function getRandomQuestions(allQuestions, count) {
        if (allQuestions.length <= count) {
            return [...allQuestions];
        }
        
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // Загрузка текущего вопроса
    function loadQuestion() {
        if (state.currentQuestionIndex >= state.currentQuestions.length) {
            showResults();
            return;
        }
        
        const question = state.currentQuestions[state.currentQuestionIndex];
        
        // Обновляем текст вопроса
        if (questionText && question.question) {
            questionText.textContent = question.question;
        }
        
        // Обновляем номер вопроса
        if (currentQuestionElement) {
            currentQuestionElement.textContent = state.currentQuestionIndex + 1;
        }
        
        // Обновляем прогресс
        if (progressFill) {
            const progressPercent = (state.currentQuestionIndex / state.currentQuestions.length) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // Очищаем контейнер с вариантами ответов
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            // Создаем кнопки для вариантов ответов
            if (question.allAnswers && Array.isArray(question.allAnswers)) {
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
            }
        }
        
        // Деактивируем кнопку "Следующий вопрос"
        if (buttons.next) {
            buttons.next.disabled = true;
        }
    }
    
    // Обработка выбора ответа
    function selectAnswer(selectedAnswer, correctAnswer) {
        // Записываем ответ пользователя
        state.userAnswers[state.currentQuestionIndex] = selectedAnswer;
        
        // Получаем все кнопки вариантов ответов
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        
        // Отключаем все кнопки и подсвечиваем правильные/неправильные ответы
        optionButtons.forEach(btn => {
            btn.disabled = true;
            
            const answerText = btn.querySelector('.option-text').textContent;
            
            if (answerText === correctAnswer) {
                btn.classList.add('correct');
            } else if (answerText === selectedAnswer && selectedAnswer !== correctAnswer) {
                btn.classList.add('incorrect');
            }
        });
        
        // Активируем кнопку "Следующий вопрос"
        if (buttons.next) {
            buttons.next.disabled = false;
        }
        
        // Сохраняем результат для текущего вопроса
        state.testResults[state.currentQuestionIndex] = {
            question: state.currentQuestions[state.currentQuestionIndex].question,
            userAnswer: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer
        };
    }
    
    // Переход к следующему вопросу
    function goToNextQuestion() {
        state.currentQuestionIndex++;
        
        if (state.currentQuestionIndex < state.currentQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }
    
    // Показ результатов
    function showResults() {
        // Подсчет результатов
        const correctAnswers = state.testResults.filter(r => r.isCorrect).length;
        const totalQuestions = state.testResults.length;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Обновление статистики
        if (scorePercentage) scorePercentage.textContent = `${score}%`;
        if (correctCount) correctCount.textContent = correctAnswers;
        if (incorrectCount) incorrectCount.textContent = totalQuestions - correctAnswers;
        if (totalCount) totalCount.textContent = totalQuestions;
        
        // Анимация круговой диаграммы
        const scoreCircle = document.querySelector('.score-circle');
        if (scoreCircle) {
            scoreCircle.style.background = `conic-gradient(#3498db ${score}%, #ecf0f1 ${score}%)`;
        }
        
        // Отображение детализации ответов
        if (resultsList) {
            resultsList.innerHTML = '';
            
            state.testResults.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
                
                resultItem.innerHTML = `
                    <div class="result-question">${index + 1}. ${result.question}</div>
                    <div class="result-answer">
                        <div class="user-answer">
                            <div class="answer-label">${getTranslation('your_answer')}</div>
                            <div class="answer-text">${result.userAnswer}</div>
                        </div>
                        ${!result.isCorrect ? `
                        <div class="correct-answer">
                            <div class="answer-label">${getTranslation('correct_answer')}</div>
                            <div class="answer-text">${result.correctAnswer}</div>
                        </div>
                        ` : ''}
                    </div>
                `;
                
                resultsList.appendChild(resultItem);
            });
        }
        
        // Показываем экран результатов
        showScreen(screens.results);
    }
    
    // Переключение языка
    function switchLanguage(lang) {
        state.language = lang;
        localStorage.setItem('test_language', lang);
        
        updateLanguageButtons();
        updateInterfaceTexts();
        loadQuestions();
        
        // Если тест был начат, возвращаем на экран выбора
        showScreen(screens.selection);
    }
    
    // Обновление кнопок переключения языка
    function updateLanguageButtons() {
        if (buttons.langRu && buttons.langKz) {
            if (state.language === 'ru') {
                buttons.langRu.classList.add('active');
                buttons.langKz.classList.remove('active');
            } else {
                buttons.langRu.classList.remove('active');
                buttons.langKz.classList.add('active');
            }
        }
    }
    
    // Обновление текстов интерфейса
    function updateInterfaceTexts() {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    // Получение перевода
    function getTranslation(key) {
        return translations[state.language] && translations[state.language][key] 
            ? translations[state.language][key] 
            : key;
    }
    
    // Перемешивание массива
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Показ экрана
    function showScreen(screen) {
        if (!screen) return;
        
        Object.values(screens).forEach(s => {
            if (s) s.classList.remove('active');
        });
        
        screen.classList.add('active');
    }
    
    // Запуск приложения
    init();
});