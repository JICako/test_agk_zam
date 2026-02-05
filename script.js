document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 10;
    
    // Названия законов
    const lawNames = {
        'ru': {
            1: 'Трудовой кодекс',
            2: 'О браке и семье', 
            3: 'Об образовании',
            4: 'О статусе педагога',
            5: 'Административный кодекс',
            6: 'Гражданский кодекс',
            7: 'Уголовный кодекс'
        },
        'kz': {
            1: 'Еңбек кодексі',
            2: 'Неке және отбасы туралы',
            3: 'Білім туралы',
            4: 'Педагогтың мәртебесі туралы',
            5: 'Әкімшілік кодекс',
            6: 'Азаматтық кодекс',
            7: 'Кылмыстық кодекс'
        }
    };
    
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
    
    // Состояние
    const state = {
        currentQuestions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        testResults: [],
        selectedLaw: 1,
        questionsByLaw: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        isLoading: false,
        language: localStorage.getItem('test_language') || 'ru',
        totalQuestionsLoaded: 0
    };
    
    // Словари переводов
    const translations = {
        'ru': {
            'title': 'Тестирование по законам',
            'subtitle': 'Проверьте свои знания основных законодательных актов',
            'choose_law': 'Выберите тест для прохождения',
            'law1_title': 'Трудовой кодекс',
            'law1_desc': 'Трудовые отношения и права работников',
            'law2_title': 'О браке и семье',
            'law2_desc': 'Семейные правоотношения',
            'law3_title': 'Об образовании',
            'law3_desc': 'Система образования и обучение',
            'law4_title': 'О статусе педагога',
            'law4_desc': 'Права и обязанности педагогов',
            'law5_title': 'Административный кодекс',
            'law5_desc': 'Административные правонарушения',
            'law6_title': 'Гражданский кодекс',
            'law6_desc': 'Гражданские правоотношения',
            'law7_title': 'Уголовный кодекс',
            'law7_desc': 'Преступления и наказания',
            'instructions': 'Инструкция',
            'instruction1': 'Выберите один из семи тестов для прохождения',
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
            'choose_another': 'Выбрать другой тест',
            'copyright': '© 2023 Тестирование по законодательным актам',
            'your_answer': 'Ваш ответ:',
            'correct_answer': 'Правильный ответ:',
            'loading': 'Загрузка вопросов...',
            'loaded': 'Загружено',
            'questions': 'вопросов',
            'error_loading': 'Ошибка загрузки вопросов',
            'no_questions': 'Для этого теста нет вопросов',
            'choose_another_law': 'Пожалуйста, выберите другой тест.',
            'available': 'доступно',
            'test_will_contain': 'Тест будет содержать все доступные вопросы.',
            'active': 'Активный'
        },
        'kz': {
            'title': 'Заңдар бойынша тестілеу',
            'subtitle': 'Негізгі заңдық актілер бойынша біліміңізді тексеріңіз',
            'choose_law': 'Өту үшін сынақты таңдаңыз',
            'law1_title': 'Еңбек кодексі',
            'law1_desc': 'Еңбек қатынастары және жұмысшылардың құқықтары',
            'law2_title': 'Неке және отбасы туралы',
            'law2_desc': 'Отбасылық құқықтық қатынастар',
            'law3_title': 'Білім туралы',
            'law3_desc': 'Білім беру жүйесі және оқыту',
            'law4_title': 'Педагогтың мәртебесі туралы',
            'law4_desc': 'Педагогтардың құқықтары мен міндеттері',
            'law5_title': 'Әкімшілік кодекс',
            'law5_desc': 'Әкімшілік құқық бұзушылықтар',
            'law6_title': 'Азаматтық кодекс',
            'law6_desc': 'Азаматтық құқықтық қатынастар',
            'law7_title': 'Кылмыстық кодекс',
            'law7_desc': 'Қылмыстар және жазалар',
            'instructions': 'Нұсқаулық',
            'instruction1': 'Өту үшін жеті сынақтың бірін таңдаңыз',
            'instruction2': 'Әрбір сынақта қайталанбайтын кездейсоқ сұрақтар бар',
            'instruction3': 'Әрбір сұрақта бір дұрыс жауапты таңдау керек',
            'instruction4': 'Жауап бергеннен кейін дұрыс нұсқаны көресіз',
            'instruction5': 'Сынақ аяқталғаннан кейін толық нәтиже аласыз',
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
            'restart_test': 'Сынақты қайта өту',
            'choose_another': 'Басқа сынақты таңдау',
            'copyright': '© 2023 Заңдық актілер бойынша тестілеу',
            'your_answer': 'Сіздің жауабыңыз:',
            'correct_answer': 'Дұрыс жауап:',
            'loading': 'Сұрақтар жүктелуде...',
            'loaded': 'Жүктелді',
            'questions': 'сұрақ',
            'error_loading': 'Сұрақтарды жүктеу кезінде қате пайда болды',
            'no_questions': 'Бұл сынақ үшін сұрақтар жоқ',
            'choose_another_law': 'Басқа сынақты таңдаңыз.',
            'available': 'қолжетімді',
            'test_will_contain': 'Тест барлық қолжетімді сұрақтарды қамтиды.',
            'active': 'Белсенді'
        }
    };
    
    // Инициализация
    function init() {
        setupEventListeners();
        updateLanguageButtons();
        updateInterfaceTexts();
        loadQuestions();
        showScreen(screens.selection);
        
        // Принудительная активация всех карточек
        forceActivateAllCards();
    }
    
    // Принудительная активация всех карточек
    function forceActivateAllCards() {
        lawCards.forEach(card => {
            const lawNumber = parseInt(card.getAttribute('data-law'));
            if (lawNumber >= 1 && lawNumber <= 7) {
                // Убираем класс inactive если есть
                card.classList.remove('inactive');
                // Добавляем класс active если нет
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                }
                
                // Принудительно меняем стили
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
                card.style.pointerEvents = 'auto';
                card.style.background = '#f8f9fa';
                
                // Обновляем статус
                const statusDiv = card.querySelector('.law-status');
                if (statusDiv) {
                    statusDiv.className = 'law-status active-status';
                    statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${getTranslation('active')}`;
                }
                
                // Обновляем цвет номера
                const numberDiv = card.querySelector('.law-number');
                if (numberDiv) {
                    numberDiv.style.background = '#3498db';
                }
                
                // Обновляем цвет заголовка
                const title = card.querySelector('h3');
                if (title) {
                    title.style.color = '#2c3e50';
                }
            }
        });
    }
    
    // Настройка обработчиков
    function setupEventListeners() {
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                const lawNumber = parseInt(card.getAttribute('data-law'));
                
                if (state.isLoading) {
                    alert(getTranslation('loading'));
                    return;
                }
                
                if (state.totalQuestionsLoaded === 0) {
                    alert(getTranslation('error_loading'));
                    return;
                }
                
                state.selectedLaw = lawNumber;
                startTest(state.selectedLaw);
            });
        });
        
        if (buttons.back) buttons.back.addEventListener('click', () => showScreen(screens.selection));
        if (buttons.next) buttons.next.addEventListener('click', goToNextQuestion);
        if (buttons.restart) buttons.restart.addEventListener('click', () => startTest(state.selectedLaw));
        if (buttons.newTest) buttons.newTest.addEventListener('click', () => showScreen(screens.selection));
        
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
    
    // Загрузка вопросов
    async function loadQuestions() {
        state.isLoading = true;
        
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> ${getTranslation('loading')}</p>`;
        
        const lawSelection = document.querySelector('.law-selection');
        if (lawSelection.querySelector('.loading-indicator')) {
            lawSelection.querySelector('.loading-indicator').remove();
        }
        lawSelection.appendChild(loadingIndicator);
        
        try {
            const filename = `questions_${state.language}.json`;
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
            
            // ДОБАВЛЯЕМ ДЕМО-ВОПРОСЫ для тестов 5-7 если их нет
            for (let law = 5; law <= 7; law++) {
                if (state.questionsByLaw[law].length === 0) {
                    addDemoQuestionsForLaw(law, 5);
                }
            }
            
            // Подсчитываем общее количество
            let totalQuestions = 0;
            for (let law = 1; law <= 7; law++) {
                totalQuestions += state.questionsByLaw[law].length;
            }
            state.totalQuestionsLoaded = totalQuestions;
            
            // Убираем индикатор
            loadingIndicator.remove();
            
            // Сообщение об успешной загрузке
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            
            let lawsInfo = [];
            for (let law = 1; law <= 7; law++) {
                if (state.questionsByLaw[law].length > 0) {
                    const isDemo = state.questionsByLaw[law][0] && state.questionsByLaw[law][0].question.includes('[Демо]');
                    lawsInfo.push(`${lawNames[state.language][law]}: ${state.questionsByLaw[law].length}${isDemo ? ' (демо)' : ''}`);
                }
            }
            
            successMessage.innerHTML = `<p><i class="fas fa-check-circle"></i> ${getTranslation('loaded')} ${totalQuestions} ${getTranslation('questions')}</p>`;
            
            if (lawsInfo.length > 0) {
                successMessage.innerHTML += `<p><small>${lawsInfo.join(', ')}</small></p>`;
            }
            
            lawSelection.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            
            loadingIndicator.remove();
            
            // Если файл не найден, создаем демо-вопросы для ВСЕХ тестов 1-7
            createDemoQuestionsForAllLaws();
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> ${getTranslation('error_loading')}</p>
                <p>${error.message}</p>
                <p>Используются демо-вопросы для всех тестов</p>
            `;
            lawSelection.appendChild(errorMessage);
            
        } finally {
            state.isLoading = false;
        }
    }
    
    // Создание демо-вопросов для всех законов 1-7
    function createDemoQuestionsForAllLaws() {
        console.log('Создание демо-вопросов для всех тестов 1-7');
        
        for (let law = 1; law <= 7; law++) {
            addDemoQuestionsForLaw(law, 5);
        }
        
        // Подсчет общего количества
        let total = 0;
        for (let law = 1; law <= 7; law++) {
            total += state.questionsByLaw[law].length;
        }
        state.totalQuestionsLoaded = total;
        
        console.log(`Создано демо-вопросов: ${total}`);
    }
    
    // Добавление демо-вопросов для конкретного закона
    function addDemoQuestionsForLaw(lawNumber, count) {
        const demoQuestions = [];
        
        for (let i = 1; i <= count; i++) {
            demoQuestions.push({
                law: lawNumber,
                question: `[Демо] ${lawNames[state.language][lawNumber]}. Вопрос ${i}: Основные положения?`,
                correctAnswer: `Правильный ответ ${i}`,
                incorrectAnswers: [
                    `Неправильный вариант ${i}.1`,
                    `Неправильный вариант ${i}.2`,
                    `Неправильный вариант ${i}.3`
                ]
            });
        }
        
        // Добавляем демо-вопросы к уже существующим
        if (!state.questionsByLaw[lawNumber]) {
            state.questionsByLaw[lawNumber] = [];
        }
        
        // Добавляем только если еще нет вопросов для этого закона
        if (state.questionsByLaw[lawNumber].length === 0) {
            state.questionsByLaw[lawNumber].push(...demoQuestions);
            console.log(`Добавлено ${count} демо-вопросов для закона ${lawNumber}`);
        }
    }
    
    // Группировка вопросов по законам
    function groupQuestionsByLaw(questions) {
        const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        
        if (Array.isArray(questions)) {
            questions.forEach(question => {
                try {
                    if (!question || !question.law || !question.question || !question.correctAnswer || !question.incorrectAnswers) {
                        console.warn('Пропущен некорректный вопрос:', question);
                        return;
                    }
                    
                    const law = parseInt(question.law);
                    if (law >= 1 && law <= 7) {
                        grouped[law].push({
                            law: law,
                            question: question.question,
                            correctAnswer: question.correctAnswer,
                            incorrectAnswers: question.incorrectAnswers
                        });
                    }
                } catch (error) {
                    console.error('Ошибка обработки вопроса:', error, question);
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
        
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            alert(`${lawNames[state.language][lawNumber]}: ${getTranslation('available')} ${allLawQuestions.length} ${getTranslation('questions')}. ${getTranslation('test_will_contain')}`);
        }
        
        // Выбираем случайные вопросы
        state.currentQuestions = getRandomQuestions(allLawQuestions, questionsToTake);
        
        // Перемешиваем варианты ответов
        state.currentQuestions.forEach(question => {
            question.allAnswers = shuffleArray([
                question.correctAnswer,
                ...question.incorrectAnswers
            ]);
        });
        
        // Сбрасываем состояние
        state.currentQuestionIndex = 0;
        state.userAnswers = [];
        state.testResults = [];
        state.selectedLaw = lawNumber;
        
        // Обновляем интерфейс
        if (currentLawElement) {
            currentLawElement.textContent = lawNames[state.language][lawNumber];
        }
        
        if (resultsLawName) {
            resultsLawName.textContent = lawNames[state.language][lawNumber];
        }
        
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = state.currentQuestions.length;
        }
        
        // Показываем экран теста
        showScreen(screens.test);
        
        // Загружаем первый вопрос
        loadQuestion();
    }
    
    // Выбор случайных вопросов
    function getRandomQuestions(allQuestions, count) {
        if (allQuestions.length <= count) {
            return [...allQuestions];
        }
        
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // Загрузка вопроса
    function loadQuestion() {
        if (state.currentQuestionIndex >= state.currentQuestions.length) {
            showResults();
            return;
        }
        
        const question = state.currentQuestions[state.currentQuestionIndex];
        
        if (questionText) {
            questionText.textContent = question.question;
        }
        
        if (currentQuestionElement) {
            currentQuestionElement.textContent = state.currentQuestionIndex + 1;
        }
        
        if (progressFill) {
            const progressPercent = (state.currentQuestionIndex / state.currentQuestions.length) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
        
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
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
        
        if (buttons.next) {
            buttons.next.disabled = true;
        }
    }
    
    // Обработка выбора ответа
    function selectAnswer(selectedAnswer, correctAnswer) {
        state.userAnswers[state.currentQuestionIndex] = selectedAnswer;
        
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        
        optionButtons.forEach(btn => {
            btn.disabled = true;
            
            const answerText = btn.querySelector('.option-text').textContent;
            
            if (answerText === correctAnswer) {
                btn.classList.add('correct');
            } else if (answerText === selectedAnswer && selectedAnswer !== correctAnswer) {
                btn.classList.add('incorrect');
            }
        });
        
        if (buttons.next) {
            buttons.next.disabled = false;
        }
        
        state.testResults[state.currentQuestionIndex] = {
            question: state.currentQuestions[state.currentQuestionIndex].question,
            userAnswer: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer
        };
    }
    
    // Следующий вопрос
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
        const correctAnswers = state.testResults.filter(r => r.isCorrect).length;
        const totalQuestions = state.testResults.length;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        if (scorePercentage) scorePercentage.textContent = `${score}%`;
        if (correctCount) correctCount.textContent = correctAnswers;
        if (incorrectCount) incorrectCount.textContent = totalQuestions - correctAnswers;
        if (totalCount) totalCount.textContent = totalQuestions;
        
        const scoreCircle = document.querySelector('.score-circle');
        if (scoreCircle) {
            scoreCircle.style.background = `conic-gradient(#3498db ${score}%, #ecf0f1 ${score}%)`;
        }
        
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
        
        showScreen(screens.results);
    }
    
    // Переключение языка
    function switchLanguage(lang) {
        state.language = lang;
        localStorage.setItem('test_language', lang);
        
        updateLanguageButtons();
        updateInterfaceTexts();
        loadQuestions();
        
        showScreen(screens.selection);
    }
    
    // Обновление кнопок языка
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
        return translations[state.language][key] || key;
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
    
    // Запуск
    init();
});