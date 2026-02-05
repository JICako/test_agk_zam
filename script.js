document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 10; // Можно изменить на 50
    
    // Названия законов для отображения
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
    
    // Состояние приложения
    const state = {
        currentQuestions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        testResults: [],
        selectedLaw: 1,
        questionsByLaw: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        isLoading: false,
        language: localStorage.getItem('test_language') || 'ru',
        totalQuestionsLoaded: 0,
        // Добавляем кеш для загруженных вопросов
        questionsCache: {}
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
            'instruction1': 'Выберите один из доступных тестов для прохождения',
            'instruction2': 'Каждый тест содержит случайные вопросы без повторений',
            'instruction3': 'В каждом вопросе нужно выбрать один правильный ответ',
            'instruction4': 'После ответа вы увидите правильный вариант',
            'instruction5': 'В конце теста вы получите детальный результат',
            'instruction6': 'Тесты 5-7 находятся в разработке и будут доступны в ближайшее время',
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
            'active': 'Активный',
            'in_development': 'В разработке',
            'available': 'доступно',
            'test_will_contain': 'Тест будет содержать все доступные вопросы.',
            'test_in_development': 'Этот тест находится в разработке и будет доступен в ближайшее время.'
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
            'instruction1': 'Өту үшін қолжетімді сынақтардың бірін таңдаңыз',
            'instruction2': 'Әрбір сынақта қайталанбайтын кездейсоқ сұрақтар бар',
            'instruction3': 'Әрбір сұрақта бір дұрыс жауапты таңдау керек',
            'instruction4': 'Жауап бергеннен кейін дұрыс нұсқаны көресіз',
            'instruction5': 'Сынақ аяқталғаннан кейін толық нәтиже аласыз',
            'instruction6': '5-7 сынақтар әзірленуде және жақын арада қолжетімді болады',
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
            'active': 'Белсенді',
            'in_development': 'Әзірленуде',
            'available': 'қолжетімді',
            'test_will_contain': 'Тест барлық қолжетімді сұрақтарды қамтиды.',
            'test_in_development': 'Бұл сынақ әзірленуде және жақын арада қолжетімді болады.'
        }
    };
    
    // Инициализация приложения
    function init() {
        console.log('Приложение инициализировано');
        setupEventListeners();
        updateLanguageButtons();
        updateInterfaceTexts();
        loadQuestions();
        showScreen(screens.selection);
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        console.log('Настройка обработчиков событий');
        
        // Карточки законов
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                const lawNumber = parseInt(card.getAttribute('data-law'));
                const isActive = card.classList.contains('active');
                const isInactive = card.classList.contains('inactive');
                
                console.log(`Клик по карточке закона ${lawNumber}, активна: ${isActive}, в разработке: ${isInactive}`);
                
                if (isInactive) {
                    alert(getTranslation('test_in_development'));
                    return;
                }
                
                if (!isActive) return;
                
                if (state.isLoading) {
                    alert(getTranslation('loading'));
                    return;
                }
                
                if (state.totalQuestionsLoaded === 0) {
                    alert(getTranslation('error_loading'));
                    return;
                }
                
                state.selectedLaw = lawNumber;
                console.log(`Запуск теста для закона ${lawNumber}`);
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
        console.log(`Начало загрузки вопросов для языка: ${state.language}`);
        state.isLoading = true;
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> ${getTranslation('loading')}</p>`;
        
        const lawSelection = document.querySelector('.law-selection');
        
        // Удаляем предыдущий индикатор, если есть
        const existingIndicator = lawSelection.querySelector('.loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Удаляем предыдущие сообщения об ошибке или успехе
        const existingMessages = lawSelection.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        lawSelection.appendChild(loadingIndicator);
        
        try {
            // Пытаемся загрузить вопросы для текущего языка
            const filename = `questions_${state.language}.json`;
            console.log(`Загрузка файла: ${filename}`);
            
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
            }
            
            const questionsData = await response.json();
            console.log(`Файл загружен, получено данных:`, questionsData);
            
            if (!Array.isArray(questionsData)) {
                console.error('Ожидался массив вопросов, получено:', typeof questionsData);
                throw new Error('Некорректный формат JSON файла: ожидается массив вопросов');
            }
            
            // Группируем вопросы по законам
            state.questionsByLaw = groupQuestionsByLaw(questionsData);
            
            // Подсчитываем общее количество загруженных вопросов
            let totalLoaded = 0;
            for (let law = 1; law <= 7; law++) {
                totalLoaded += state.questionsByLaw[law].length;
            }
            state.totalQuestionsLoaded = totalLoaded;
            
            console.log('Вопросы загружены по законам:');
            for (let law = 1; law <= 7; law++) {
                console.log(`Закон ${law}: ${state.questionsByLaw[law].length} вопросов`);
            }
            console.log(`Всего загружено: ${totalLoaded} вопросов`);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об успешной загрузке
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            
            let messageText = `<p><i class="fas fa-check-circle"></i> ${getTranslation('loaded')} ${totalLoaded} ${getTranslation('questions')}`;
            
            // Добавляем информацию по законам
            let lawsWithQuestions = [];
            for (let law = 1; law <= 4; law++) { // Только для активных законов
                if (state.questionsByLaw[law].length > 0) {
                    lawsWithQuestions.push(`${lawNames[state.language][law]}: ${state.questionsByLaw[law].length}`);
                }
            }
            
            if (lawsWithQuestions.length > 0) {
                messageText += `<br><small>${lawsWithQuestions.join(', ')}</small>`;
            }
            
            messageText += '</p>';
            successMessage.innerHTML = messageText;
            
            lawSelection.appendChild(successMessage);
            
            // Через 5 секунд убираем сообщение
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 5000);
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> ${getTranslation('error_loading')}</p>
                <p>${error.message}</p>
                <p>Убедитесь, что файл questions_${state.language}.json находится в той же папке</p>
                <p>и имеет правильный формат JSON</p>
            `;
            lawSelection.appendChild(errorMessage);
            
            // Создаем демо-вопросы для тестирования
            console.log('Создание демо-вопросов');
            createDemoQuestions();
        } finally {
            state.isLoading = false;
            console.log('Загрузка вопросов завершена');
        }
    }
    
    // Создание демо-вопросов для тестирования
    function createDemoQuestions() {
        const demoQuestions = [];
        console.log('Создание демо-вопросов для законов 1-4');
        
        // Создаем демо-вопросы для законов 1-4
        for (let law = 1; law <= 4; law++) {
            for (let i = 1; i <= 5; i++) { // Создаем по 5 демо-вопросов на каждый закон
                demoQuestions.push({
                    law: law,
                    question: `[Демо] ${lawNames[state.language][law]}. Вопрос ${i}: Основные положения?`,
                    correctAnswer: `Правильный ответ ${i}`,
                    incorrectAnswers: [
                        `Неправильный вариант ${i}.1`,
                        `Неправильный вариант ${i}.2`,
                        `Неправильный вариант ${i}.3`
                    ]
                });
            }
        }
        
        state.questionsByLaw = groupQuestionsByLaw(demoQuestions);
        
        let totalLoaded = 0;
        for (let law = 1; law <= 7; law++) {
            totalLoaded += state.questionsByLaw[law].length;
        }
        state.totalQuestionsLoaded = totalLoaded;
        
        console.log('Демо-вопросы созданы:', state.totalQuestionsLoaded);
    }
    
    // Группировка вопросов по законам
    function groupQuestionsByLaw(questions) {
        const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        
        if (Array.isArray(questions)) {
            console.log(`Обработка массива из ${questions.length} вопросов`);
            
            questions.forEach((question, index) => {
                try {
                    // Проверяем наличие необходимых полей
                    if (!question || typeof question !== 'object') {
                        console.warn(`Вопрос ${index} пропущен: не является объектом`, question);
                        return;
                    }
                    
                    // Проверяем наличие обязательных полей
                    if (!question.question || typeof question.question !== 'string') {
                        console.warn(`Вопрос ${index} пропущен: отсутствует или некорректен текст вопроса`, question);
                        return;
                    }
                    
                    if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
                        console.warn(`Вопрос ${index} пропущен: отсутствует или некорректен правильный ответ`, question);
                        return;
                    }
                    
                    if (!question.incorrectAnswers || !Array.isArray(question.incorrectAnswers)) {
                        console.warn(`Вопрос ${index} пропущен: отсутствует или некорректен массив неправильных ответов`, question);
                        return;
                    }
                    
                    // Преобразуем номер закона
                    let law;
                    if (typeof question.law === 'string') {
                        law = parseInt(question.law, 10);
                    } else if (typeof question.law === 'number') {
                        law = question.law;
                    } else {
                        console.warn(`Вопрос ${index} пропущен: некорректный тип номера закона`, question.law);
                        return;
                    }
                    
                    // Проверяем, что номер закона от 1 до 7
                    if (isNaN(law) || law < 1 || law > 7) {
                        console.warn(`Вопрос ${index} пропущен: номер закона вне диапазона 1-7`, law);
                        return;
                    }
                    
                    // Проверяем, что в массиве неправильных ответов есть хотя бы 1 элемент
                    if (question.incorrectAnswers.length < 1) {
                        console.warn(`Вопрос ${index} пропущен: недостаточно неправильных ответов`, question.incorrectAnswers);
                        return;
                    }
                    
                    // Очищаем текст от лишних пробелов
                    const cleanedQuestion = {
                        law: law,
                        question: question.question.trim(),
                        correctAnswer: question.correctAnswer.trim(),
                        incorrectAnswers: question.incorrectAnswers.map(answer => 
                            typeof answer === 'string' ? answer.trim() : String(answer)
                        )
                    };
                    
                    grouped[law].push(cleanedQuestion);
                    
                } catch (error) {
                    console.error(`Ошибка при обработке вопроса ${index}:`, error, question);
                }
            });
        } else {
            console.error('questions не является массивом:', typeof questions);
        }
        
        return grouped;
    }
    
    // Начало теста
    function startTest(lawNumber) {
        console.log(`Запуск теста для закона ${lawNumber} (${lawNames[state.language][lawNumber]})`);
        
        const allLawQuestions = state.questionsByLaw[lawNumber] || [];
        console.log(`Найдено вопросов для закона ${lawNumber}: ${allLawQuestions.length}`);
        
        if (allLawQuestions.length === 0) {
            console.error(`Нет вопросов для закона ${lawNumber}`);
            alert(`${getTranslation('no_questions')} ${getTranslation('choose_another_law')}`);
            return;
        }
        
        // Определяем количество вопросов для теста
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        console.log(`Будет выбрано ${questionsToTake} вопросов из ${allLawQuestions.length} доступных`);
        
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            const message = `${lawNames[state.language][lawNumber]}: ${getTranslation('available')} ${allLawQuestions.length} ${getTranslation('questions')}. ${getTranslation('test_will_contain')}`;
            console.log(message);
            alert(message);
        }
        
        // Выбираем случайные вопросы без повторений
        state.currentQuestions = getRandomQuestions(allLawQuestions, questionsToTake);
        console.log(`Выбрано ${state.currentQuestions.length} случайных вопросов`);
        
        // Перемешиваем варианты ответов в каждом вопросе
        state.currentQuestions.forEach(question => {
            if (question.correctAnswer && question.incorrectAnswers) {
                // Собираем все ответы
                const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
                
                // Перемешиваем ответы
                question.allAnswers = shuffleArray(allAnswers);
                
                console.log(`Вопрос: ${question.question.substring(0, 50)}...`);
                console.log(`Варианты ответов: ${question.allAnswers.length}`);
            }
        });
        
        // Сбрасываем состояние теста
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
    
    // Выбор случайных вопросов без повторений
    function getRandomQuestions(allQuestions, count) {
        if (allQuestions.length <= count) {
            console.log(`Используем все ${allQuestions.length} доступных вопросов`);
            return [...allQuestions];
        }
        
        console.log(`Выбираем ${count} случайных вопросов из ${allQuestions.length}`);
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // Загрузка текущего вопроса
    function loadQuestion() {
        console.log(`Загрузка вопроса ${state.currentQuestionIndex + 1} из ${state.currentQuestions.length}`);
        
        if (state.currentQuestionIndex >= state.currentQuestions.length) {
            console.log('Все вопросы пройдены, показываем результаты');
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
                        console.log(`Выбран ответ: ${answer.substring(0, 30)}...`);
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
                console.log('Ответ помечен как правильный');
            } else if (answerText === selectedAnswer && selectedAnswer !== correctAnswer) {
                btn.classList.add('incorrect');
                console.log('Ответ помечен как неправильный');
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
        
        console.log(`Результат вопроса: ${selectedAnswer === correctAnswer ? 'Правильно' : 'Неправильно'}`);
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
        console.log('Показ результатов теста');
        
        // Подсчет результатов
        const correctAnswers = state.testResults.filter(r => r.isCorrect).length;
        const totalQuestions = state.testResults.length;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        console.log(`Результаты: ${correctAnswers} правильных из ${totalQuestions} (${score}%)`);
        
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
        console.log(`Переключение языка на ${lang}`);
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
        console.log(`Активный экран: ${screen.id}`);
    }
    
    // Запуск приложения
    init();
});