document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация
    const QUESTIONS_PER_TEST = 10;
    
    // Названия законов
    const lawNames = {
        1: 'Трудовой кодекс',
        2: 'О браке и семье', 
        3: 'Об образовании',
        4: 'О статусе педагога',
        5: 'О правах ребенка',
        6: 'МЖМС',
        7: 'О мерах по борьбе с коррупцией'
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
        
        lawCards.forEach(card => {
            card.addEventListener('click', function() {
                const lawNumber = parseInt(this.getAttribute('data-law'));
                console.log('Клик по карточке закона:', lawNumber);
                
                if (state.isLoading) {
                    alert('Загрузка вопросов...');
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
    
    // Загрузка вопросов
    async function loadQuestions() {
        console.log('Загрузка вопросов');
        state.isLoading = true;
        
        try {
            const filename = 'questions_ru.json';
            console.log('Попытка загрузить файл:', filename);
            
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
            console.log('По законам:', state.questionsByLaw);
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            
            // Создаем демо-вопросы для всех тестов
            createDemoQuestionsForAllLaws();
            
            alert('Используются демо-вопросы. Для реальных вопросов создайте файл questions_ru.json');
        } finally {
            state.isLoading = false;
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
        
        for (let i = 1; i <= count; i++) {
            demoQuestions.push({
                law: lawNumber,
                question: `[Демо] ${lawNames[lawNumber]}. Вопрос ${i}: Основные положения?`,
                correctAnswer: `Правильный ответ ${i}`,
                incorrectAnswers: [
                    `Неправильный вариант ${i}.1`,
                    `Неправильный вариант ${i}.2`,
                    `Неправильный вариант ${i}.3`
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
        console.log(`Запуск теста для закона ${lawNumber}: ${lawNames[lawNumber]}`);
        
        const allLawQuestions = state.questionsByLaw[lawNumber] || [];
        console.log(`Найдено вопросов: ${allLawQuestions.length}`);
        
        if (allLawQuestions.length === 0) {
            alert('Для этого теста нет вопросов. Пожалуйста, выберите другой тест.');
            return;
        }
        
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            alert(`${lawNames[lawNumber]}: доступно ${allLawQuestions.length} вопросов. Тест будет содержать все доступные вопросы.`);
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
            currentLawElement.textContent = lawNames[lawNumber];
        }
        
        if (resultsLawName) {
            resultsLawName.textContent = lawNames[lawNumber];
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