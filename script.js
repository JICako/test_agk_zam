document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 50;
    
    // Элементы DOM
    const testSelectionScreen = document.getElementById('test-selection-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');
    const lawCards = document.querySelectorAll('.law-card');
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const restartTestBtn = document.getElementById('restart-test-btn');
    const newTestBtn = document.getElementById('new-test-btn');
    const langKzBtn = document.getElementById('lang-kz');
    const langRuBtn = document.getElementById('lang-ru');
    
    // Элементы тестирования
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const progressFill = document.querySelector('.progress-fill');
    const currentLawElement = document.getElementById('current-law');
    const resultsLawName = document.getElementById('results-law-name');
    
    // Элементы результатов
    const scorePercentage = document.getElementById('score-percentage');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const totalCount = document.getElementById('total-count');
    const resultsList = document.getElementById('results-list');
    
    // Переменные состояния
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let testResults = [];
    let selectedLaw = 1;
    let allQuestionsByLaw = {};
    let isLoading = false;
    let currentLanguage = 'ru'; // 'ru' или 'kz'
    
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
            'instruction2': 'Каждый тест содержит 50 случайных вопросов',
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
            'copyright': '© 2023 Тестирование по законам. Все права защищены.',
            'your_answer': 'Ваш ответ:',
            'correct_answer': 'Правильный ответ:',
            'loading': 'Загрузка вопросов...',
            'loaded': 'Загружено',
            'questions': 'вопросов',
            'error_loading': 'Ошибка загрузки вопросов',
            'no_questions': 'Для этого закона нет вопросов',
            'choose_another_law': 'Пожалуйста, выберите другой закон.'
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
            'instruction2': 'Әрбір тестте 50 кездейсоқ сұрақ бар',
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
            'copyright': '© 2023 Заңдар бойынша тестілеу. Барлық құқықтар қорғалған.',
            'your_answer': 'Сіздің жауабыңыз:',
            'correct_answer': 'Дұрыс жауап:',
            'loading': 'Сұрақтар жүктелуде...',
            'loaded': 'Жүктелді',
            'questions': 'сұрақ',
            'error_loading': 'Сұрақтарды жүктеу кезінде қате пайда болды',
            'no_questions': 'Бұл заң үшін сұрақтар жоқ',
            'choose_another_law': 'Басқа заңды таңдаңыз.'
        }
    };
    
    // Инициализация
    initializeApp();
    
    function initializeApp() {
        // Загружаем сохраненный язык из localStorage
        const savedLanguage = localStorage.getItem('test_language');
        if (savedLanguage) {
            currentLanguage = savedLanguage;
        }
        
        // Устанавливаем активную кнопку языка
        updateLanguageButtons();
        
        // Загружаем вопросы при инициализации
        loadQuestions();
        
        // Добавляем обработчики событий
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                if (isLoading) {
                    alert(getTranslation('loading'));
                    return;
                }
                
                if (Object.keys(allQuestionsByLaw).length === 0) {
                    alert(getTranslation('error_loading'));
                    return;
                }
                
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
        
        // Обработчики переключения языка
        langKzBtn.addEventListener('click', () => {
            if (currentLanguage !== 'kz') {
                switchLanguage('kz');
            }
        });
        
        langRuBtn.addEventListener('click', () => {
            if (currentLanguage !== 'ru') {
                switchLanguage('ru');
            }
        });
        
        // Показываем экран выбора теста
        showScreen(testSelectionScreen);
    }
    
    async function loadQuestions() {
        isLoading = true;
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> ${getTranslation('loading')}</p>`;
        document.querySelector('.law-selection').appendChild(loadingIndicator);
        
        try {
            // Загружаем вопросы из JSON файла в зависимости от языка
            const filename = `questions_${currentLanguage}.json`;
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`HTTP қате! Статус: ${response.status}`);
            }
            
            const allQuestionsData = await response.json();
            console.log('Сұрақтар сәтті жүктелді:', allQuestionsData.length);
            
            // Группируем вопросы по законам
            allQuestionsByLaw = groupQuestionsByLaw(allQuestionsData);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об успешной загрузке
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            
            // Подсчитываем общее количество вопросов по всем законам
            let totalQuestions = 0;
            for (let law in allQuestionsByLaw) {
                totalQuestions += allQuestionsByLaw[law].length;
            }
            
            successMessage.innerHTML = `<p><i class="fas fa-check-circle"></i> ${getTranslation('loaded')} ${totalQuestions} ${getTranslation('questions')}</p>`;
            document.querySelector('.law-selection').appendChild(successMessage);
            
            // Через 3 секунды убираем сообщение
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Сұрақтарды жүктеу кезінде қате:', error);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> ${getTranslation('error_loading')}</p>
                <p>${error.message}</p>
                <p>Файл questions_${currentLanguage}.json-дың дұрыс орналасқанына көз жеткізіңіз</p>
                <p>Немесе сайтты жергілікті серверде іске қосыңыз</p>
            `;
            document.querySelector('.law-selection').appendChild(errorMessage);
            
            // Блокируем карточки законов
            lawCards.forEach(card => {
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
                card.style.pointerEvents = 'none';
            });
            
        } finally {
            isLoading = false;
        }
    }
    
    function switchLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('test_language', lang);
        
        // Обновляем кнопки языка
        updateLanguageButtons();
        
        // Обновляем тексты интерфейса
        updateInterfaceTexts();
        
        // Перезагружаем вопросы на новом языке
        loadQuestions();
        
        // Если тест был начат, возвращаем на экран выбора
        showScreen(testSelectionScreen);
    }
    
    function updateLanguageButtons() {
        if (currentLanguage === 'kz') {
            langKzBtn.classList.add('active');
            langRuBtn.classList.remove('active');
        } else {
            langKzBtn.classList.remove('active');
            langRuBtn.classList.add('active');
        }
    }
    
    function updateInterfaceTexts() {
        // Обновляем все элементы с data-lang атрибутом
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            element.textContent = getTranslation(key);
        });
        
        // Обновляем заголовок закона в тесте
        if (currentLawElement) {
            currentLawElement.innerHTML = `${getTranslation('law')} ${selectedLaw}`;
        }
        
        if (resultsLawName) {
            resultsLawName.innerHTML = `${getTranslation('law')} ${selectedLaw}`;
        }
    }
    
    function getTranslation(key) {
        return translations[currentLanguage][key] || key;
    }
    
    function groupQuestionsByLaw(questions) {
        const grouped = {1: [], 2: [], 3: [], 4: [], 5: []};
        
        questions.forEach(question => {
            const law = parseInt(question.law);
            if (law >= 1 && law <= 5) {
                grouped[law].push(question);
            }
        });
        
        return grouped;
    }
    
    function startTest(lawNumber) {
        // Получаем все вопросы для выбранного закона
        const allLawQuestions = allQuestionsByLaw[lawNumber] || [];
        
        // Проверяем, есть ли вопросы для выбранного закона
        if (allLawQuestions.length === 0) {
            alert(`${getTranslation('no_questions')} ${getTranslation('choose_another_law')}`);
            return;
        }
        
        // Проверяем, достаточно ли вопросов
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            alert(`${getTranslation('law')} ${lawNumber} ${getTranslation('available')} ${allLawQuestions.length} ${getTranslation('questions')}. ${getTranslation('test_will_contain')}`);
        }
        
        // Выбираем случайные вопросы без повторений
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        currentQuestions = getRandomQuestions(allLawQuestions, questionsToTake);
        
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
        currentLawElement.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        resultsLawName.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        totalQuestionsElement.textContent = currentQuestions.length;
        
        // Показываем экран тестирования
        showScreen(testScreen);
        
        // Загружаем первый вопрос
        loadQuestion();
    }
    
    function getRandomQuestions(allQuestions, count) {
        // Создаем копию массива вопросов
        const questionsCopy = [...allQuestions];
        const selectedQuestions = [];
        
        // Выбираем случайные вопросы без повторений
        for (let i = 0; i < count && questionsCopy.length > 0; i++) {
            // Выбираем случайный индекс
            const randomIndex = Math.floor(Math.random() * questionsCopy.length);
            
            // Извлекаем вопрос по индексу
            const randomQuestion = questionsCopy.splice(randomIndex, 1)[0];
            selectedQuestions.push(randomQuestion);
        }
        
        return selectedQuestions;
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
});