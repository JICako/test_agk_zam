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
    
    // Инициализация
    initializeApp();
    
    function initializeApp() {
        // Загружаем вопросы при инициализации
        loadQuestions();
        
        // Добавляем обработчики событий
        lawCards.forEach(card => {
            card.addEventListener('click', () => {
                if (isLoading) {
                    alert('Вопросы еще загружаются. Пожалуйста, подождите...');
                    return;
                }
                
                if (Object.keys(allQuestionsByLaw).length === 0) {
                    alert('Вопросы не загружены. Проверьте наличие файла questions.json и подключение к интернету.');
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
        
        // Показываем экран выбора теста
        showScreen(testSelectionScreen);
    }
    
    async function loadQuestions() {
        isLoading = true;
        
        // Показываем индикатор загрузки
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Загрузка вопросов...</p>';
        document.querySelector('.law-selection').appendChild(loadingIndicator);
        
        try {
            // Загружаем вопросы из JSON файла
            const response = await fetch('questions.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }
            
            const allQuestionsData = await response.json();
            console.log('Вопросы успешно загружены:', allQuestionsData.length);
            
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
            
            successMessage.innerHTML = `<p><i class="fas fa-check-circle"></i> Загружено ${totalQuestions} вопросов</p>`;
            document.querySelector('.law-selection').appendChild(successMessage);
            
            // Через 3 секунды убираем сообщение
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            
            // Убираем индикатор загрузки
            loadingIndicator.remove();
            
            // Показываем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> Ошибка загрузки вопросов</p>
                <p>${error.message}</p>
                <p>Убедитесь, что файл questions.json находится в той же директории, что и index.html</p>
                <p>Или запустите сайт на локальном сервере (например, через Live Server в VS Code)</p>
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
            alert(`Для закона ${lawNumber} нет вопросов. Пожалуйста, выберите другой закон.`);
            return;
        }
        
        // Проверяем, достаточно ли вопросов
        if (allLawQuestions.length < QUESTIONS_PER_TEST) {
            alert(`Для закона ${lawNumber} доступно только ${allLawQuestions.length} вопросов. Тест будет содержать все доступные вопросы.`);
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
        currentLawElement.textContent = `Закон ${lawNumber}`;
        resultsLawName.textContent = `Закон ${lawNumber}`;
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
});