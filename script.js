document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 30;
    
    // Текущий язык (по умолчанию русский)
    let currentLanguage = 'ru';
    
    // Названия законов на разных языках
    const lawNames = {
        ru: {
            1: 'Трудовой кодекс',
            2: 'О браке и семье', 
            3: 'Об образовании',
            4: 'О статусе педагога',
            5: 'О правах ребенка',
            6: 'Гражданский кодекс',
            7: 'Уголовный кодекс'
        },
        kz: {
            1: 'Еңбек кодексі',
            2: 'Неке және отбасы туралы',
            3: 'Білім туралы',
            4: 'Педагог мәртебесі туралы',
            5: 'Бала құқықтары туралы',
            6: 'Азаматтық кодекс',
            7: 'Кылмыстық кодекс'
        }
    };
    
    // Тексты интерфейса на разных языках
    const uiTexts = {
        ru: {
            subtitle: 'Проверьте свои знания основных законодательных актов',
            selectTest: 'Выберите тест для прохождения',
            instruction: 'Инструкция',
            instructions: [
                'Выберите один из семи тестов для прохождения',
                'Каждый тест содержит 10 случайных вопросов без повторений',
                'В каждом вопросе нужно выбрать один правильный ответ',
                'После ответа вы увидите правильный вариант',
                'В конце теста вы получите детальный результат'
            ],
            question: 'Вопрос',
            of: 'из',
            back: 'Назад',
            next: 'Следующий вопрос',
            finish: 'Завершить тест',
            results: 'Результаты тестирования',
            correctAnswers: 'правильных ответов',
            correctCount: 'Правильных ответов',
            incorrectCount: 'Неправильных ответов',
            totalCount: 'Всего вопросов',
            details: 'Детализация ответов',
            yourAnswer: 'Ваш ответ:',
            correctAnswer: 'Правильный ответ:',
            restart: 'Пройти тест заново',
            newTest: 'Выбрать другой тест',
            activeStatus: 'Активный',
            footer: '© 2023 Тестирование по законодательным актам'
        },
        kz: {
            subtitle: 'Негізгі заңнамалық актілер бойынша біліміңізді тексеріңіз',
            selectTest: 'Өту үшін сынақты таңдаңыз',
            instruction: 'Нұсқаулық',
            instructions: [
                'Өту үшін жеті сынақтың бірін таңдаңыз',
                'Әрбір сынақта қайталанбайтын 10 кездейсоқ сұрақ бар',
                'Әрбір сұрақта бір дұрыс жауапты таңдау керек',
                'Жауап бергеннен кейін сіз дұрыс нұсқаны көресіз',
                'Сынақтың соңында сіз егжей-тегжейлі нәтиже аласыз'
            ],
            question: 'Сұрақ',
            of: 'дан',
            back: 'Артқа',
            next: 'Келесі сұрақ',
            finish: 'Сынақты аяқтау',
            results: 'Сынақ нәтижелері',
            correctAnswers: 'дұрыс жауаптар',
            correctCount: 'Дұрыс жауаптар',
            incorrectCount: 'Қате жауаптар',
            totalCount: 'Барлық сұрақтар',
            details: 'Жауаптардың егжей-тегжейлі тізімі',
            yourAnswer: 'Сіздің жауабыңыз:',
            correctAnswer: 'Дұрыс жауап:',
            restart: 'Сынақты қайта өту',
            newTest: 'Басқа сынақты таңдау',
            activeStatus: 'Белсенді',
            footer: '© 2023 Заңнамалық актілер бойынша тестілеу'
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
        newTest: document.getElementById('new-test-btn')
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
    
    // Кнопки переключения языка
    const langButtons = {
        ru: document.getElementById('lang-ru'),
        kz: document.getElementById('lang-kz')
    };
    
    // Состояние
    const state = {
        currentQuestions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        testResults: [],
        selectedLaw: 1,
        questionsByLaw: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        isLoading: false,
        totalQuestionsLoaded: 0
    };
    
    // Инициализация
    function init() {
        console.log('Инициализация приложения');
        setupEventListeners();
        loadQuestions();
        showScreen(screens.selection);
    }
    
    // Настройка обработчиков
    function setupEventListeners() {
        console.log('Настройка обработчиков событий');
        
        // Обработчики для кнопок языка
        if (langButtons.ru) {
            langButtons.ru.addEventListener('click', () => switchLanguage('ru'));
        }
        
        if (langButtons.kz) {
            langButtons.kz.addEventListener('click', () => switchLanguage('kz'));
        }
        
        // Обработчики для карточек законов
        lawCards.forEach(card => {
            card.addEventListener('click', function() {
                const lawNumber = parseInt(this.getAttribute('data-law'));
                console.log('Клик по карточке закона:', lawNumber);
                
                if (state.isLoading) {
                    alert(currentLanguage === 'ru' 
                        ? 'Загрузка вопросов...' 
                        : 'Сұрақтар жүктелуде...');
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
    }
    
    // Переключение языка
    function switchLanguage(lang) {
        if (currentLanguage === lang) return;
        
        console.log(`Переключение языка на: ${lang}`);
        currentLanguage = lang;
        
        // Обновляем активные кнопки языка
        Object.keys(langButtons).forEach(key => {
            if (langButtons[key]) {
                if (key === lang) {
                    langButtons[key].classList.add('active');
                } else {
                    langButtons[key].classList.remove('active');
                }
            }
        });
        
        // Обновляем тексты интерфейса
        updateInterfaceTexts();
        
        // Перезагружаем вопросы на новом языке
        loadQuestions();
        
        // Если тест активен, обновляем вопросы
        if (screens.test.classList.contains('active')) {
            startTest(state.selectedLaw);
        }
        
        // Если открыты результаты, обновляем их
        if (screens.results.classList.contains('active')) {
            showResults();
        }
    }
    
    // Обновление текстов интерфейса
    function updateInterfaceTexts() {
        const texts = uiTexts[currentLanguage];
        
        // Обновляем заголовки
        const title = document.querySelector('.header h1');
        if (title) {
            title.innerHTML = `<i class="fas fa-graduation-cap"></i> ${currentLanguage === 'ru' ? 'Тестирование по законам' : 'Заңдар бойынша тестілеу'}`;
        }
        
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = texts.subtitle;
        }
        
        const selectTest = document.querySelector('.law-selection h2');
        if (selectTest) {
            selectTest.innerHTML = `<i class="fas fa-book-open"></i> ${texts.selectTest}`;
        }
        
        // Обновляем инструкцию
        const instructionTitle = document.querySelector('.instructions h3');
        if (instructionTitle) {
            instructionTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${texts.instruction}`;
        }
        
        const instructionItems = document.querySelectorAll('.instructions li');
        if (instructionItems && texts.instructions) {
            instructionItems.forEach((item, index) => {
                if (texts.instructions[index]) {
                    item.textContent = texts.instructions[index];
                }
            });
        }
        
        // Обновляем статусы на карточках
        const statusElements = document.querySelectorAll('.law-status');
        statusElements.forEach(el => {
            el.innerHTML = `<i class="fas fa-check-circle"></i> ${texts.activeStatus}`;
        });
        
        // Обновляем текст кнопки "Назад"
        if (buttons.back) {
            buttons.back.innerHTML = `<i class="fas fa-arrow-left"></i> ${texts.back}`;
        }
        
        // Обновляем текст кнопки "Следующий"
        if (buttons.next) {
            buttons.next.innerHTML = `${texts.next} <i class="fas fa-arrow-right"></i>`;
        }
        
        // Обновляем footer
        const footer = document.querySelector('.footer p');
        if (footer) {
            footer.textContent = texts.footer;
        }
    }
    
    // Загрузка вопросов
    async function loadQuestions() {
        console.log('Загрузка вопросов для языка:', currentLanguage);
        state.isLoading = true;
        
        try {
            const filename = `questions_${currentLanguage}.json`;
            console.log('Попытка загрузить файл:', filename);
            
            const response = await fetch(filename);
            
            if (!response.ok) {
                // Пробуем загрузить русский как fallback
                if (currentLanguage !== 'ru') {
                    console.log('Файл не найден, пробуем русскую версию...');
                    return loadRussianFallback();
                }
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            const questionsData = await response.json();
            
            if (!Array.isArray(questionsData)) {
                throw new Error('Некорректный формат JSON файла');
            }
            
            // Группируем вопросы по законам
            state.questionsByLaw = groupQuestionsByLaw(questionsData);
            
            // Добавляем демо-вопросы для тестов без вопросов
            for (let law = 1; law <= 7; law++) {
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
            
            console.log('Вопросы загружены:', totalQuestions);
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            
            // Создаем демо-вопросы для всех тестов
            createDemoQuestionsForAllLaws();
            
            const message = currentLanguage === 'ru'
                ? 'Используются демо-вопросы. Для реальных вопросов создайте файлы questions_ru.json и questions_kz.json'
                : 'Демо сұрақтар қолданылады. Нақты сұрақтар үшін questions_ru.json және questions_kz.json файлдарын жасаңыз';
            
            // Показываем уведомление только один раз при загрузке
            if (!state.demoAlertShown) {
                alert(message);
                state.demoAlertShown = true;
            }
        } finally {
            state.isLoading = false;
        }
    }
    
    // Загрузка русских вопросов как fallback
    async function loadRussianFallback() {
        try {
            const response = await fetch('questions_ru.json');
            if (!response.ok) throw new Error('Файл не найден');
            
            const questionsData = await response.json();
            state.questionsByLaw = groupQuestionsByLaw(questionsData);
            
            // Добавляем демо-вопросы для недостающих тестов
            for (let law = 1; law <= 7; law++) {
                if (state.questionsByLaw[law].length === 0) {
                    addDemoQuestionsForLaw(law, 5);
                }
            }
            
            console.log('Использованы русские вопросы как fallback');
            
        } catch (error) {
            console.error('Не удалось загрузить русские вопросы:', error);
            createDemoQuestionsForAllLaws();
        }
    }
    
    // Создание демо-вопросов для всех законов
    function createDemoQuestionsForAllLaws() {
        console.log('Создание демо-вопросов для всех тестов');
        
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
        const lawName = lawNames[currentLanguage][lawNumber] || lawNames['ru'][lawNumber];
        
        for (let i = 1; i <= count; i++) {
            demoQuestions.push({
                law: lawNumber,
                question: `[Демо] ${lawName}. Сұрақ ${i}: Негізгі ережелер?`,
                correctAnswer: currentLanguage === 'ru' 
                    ? `Правильный ответ ${i}` 
                    : `Дұрыс жауап ${i}`,
                incorrectAnswers: [
                    currentLanguage === 'ru' 
                        ? `Неправильный вариант ${i}.1` 
                        : `Қате нұсқа ${i}.1`,
                    currentLanguage === 'ru' 
                        ? `Неправильный вариант ${i}.2` 
                        : `Қате нұсқа ${i}.2`,
                    currentLanguage === 'ru' 
                        ? `Неправильный вариант ${i}.3` 
                        : `Қате нұсқа ${i}.3`
                ]
            });
        }
        
        // Добавляем демо-вопросы
        if (!state.questionsByLaw[lawNumber]) {
            state.questionsByLaw[lawNumber] = [];
        }
        
        // Добавляем только если еще нет вопросов
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
                    console.error('Ошибка обработки вопроса:', error);
                }
            });
        }
        
        return grouped;
    }
    
    // Начало теста
    function startTest(lawNumber) {
        console.log(`Запуск теста для закона ${lawNumber}`);
        
        const allLawQuestions = state.questionsByLaw[lawNumber] || [];
        console.log(`Найдено вопросов: ${allLawQuestions.length}`);
        
        if (allLawQuestions.length === 0) {
            const message = currentLanguage === 'ru'
                ? 'Для этого теста нет вопросов. Пожалуйста, выберите другой тест.'
                : 'Бұл сынақ үшін сұрақтар жоқ. Басқа сынақты таңдаңыз.';
            alert(message);
            return;
        }
        
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            const lawName = lawNames[currentLanguage][lawNumber];
            const message = currentLanguage === 'ru'
                ? `${lawName}: доступно ${allLawQuestions.length} вопросов. Тест будет содержать все доступные вопросы.`
                : `${lawName}: ${allLawQuestions.length} сұрақ бар. Сынақта барлық қол жетімді сұрақтар болады.`;
            alert(message);
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
            currentLawElement.textContent = lawNames[currentLanguage][lawNumber];
        }
        
        if (resultsLawName) {
            resultsLawName.textContent = lawNames[currentLanguage][lawNumber];
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
        
        // Обновляем заголовок результатов
        const resultsTitle = document.querySelector('.results-header h1');
        if (resultsTitle) {
            resultsTitle.innerHTML = `<i class="fas fa-chart-line"></i> ${uiTexts[currentLanguage].results}`;
        }
        
        // Обновляем подписи
        const scoreLabel = document.querySelector('.score-label');
        if (scoreLabel) {
            scoreLabel.textContent = uiTexts[currentLanguage].correctAnswers;
        }
        
        const correctLabel = document.querySelector('.score-detail.correct .score-text');
        if (correctLabel) {
            correctLabel.textContent = uiTexts[currentLanguage].correctCount;
        }
        
        const incorrectLabel = document.querySelector('.score-detail.incorrect .score-text');
        if (incorrectLabel) {
            incorrectLabel.textContent = uiTexts[currentLanguage].incorrectCount;
        }
        
        const totalLabel = document.querySelector('.score-detail.total .score-text');
        if (totalLabel) {
            totalLabel.textContent = uiTexts[currentLanguage].totalCount;
        }
        
        const detailsTitle = document.querySelector('.results-details h3');
        if (detailsTitle) {
            detailsTitle.innerHTML = `<i class="fas fa-list-check"></i> ${uiTexts[currentLanguage].details}`;
        }
        
        // Обновляем текст кнопок
        if (buttons.restart) {
            buttons.restart.innerHTML = `<i class="fas fa-redo"></i> ${uiTexts[currentLanguage].restart}`;
        }
        
        if (buttons.newTest) {
            buttons.newTest.innerHTML = `<i class="fas fa-book"></i> ${uiTexts[currentLanguage].newTest}`;
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
                            <div class="answer-label">${uiTexts[currentLanguage].yourAnswer}</div>
                            <div class="answer-text">${result.userAnswer}</div>
                        </div>
                        ${!result.isCorrect ? `
                        <div class="correct-answer">
                            <div class="answer-label">${uiTexts[currentLanguage].correctAnswer}</div>
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