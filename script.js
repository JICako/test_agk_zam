document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
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
    
    console.log('Найдено карточек законов:', lawCards.length);
    
    // Элементы тестирования
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const progressFill = document.querySelector('.progress-fill');
    const currentLawElement = document.getElementById('current-law');
    const resultsLawName = document.getElementById('results-law-name');
    
    // Переменные состояния
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let testResults = [];
    let selectedLaw = 1;
    let allQuestionsByLaw = {1: [], 2: [], 3: [], 4: [], 5: []};
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
        console.log('Инициализация приложения');
        
        // Загружаем сохраненный язык из localStorage
        const savedLanguage = localStorage.getItem('test_language');
        if (savedLanguage) {
            currentLanguage = savedLanguage;
            console.log('Загружен сохраненный язык:', currentLanguage);
        }
        
        // Устанавливаем активную кнопку языка
        updateLanguageButtons();
        
        // Обновляем тексты интерфейса
        updateInterfaceTexts();
        
        // Добавляем обработчики событий для карточек законов
        lawCards.forEach((card, index) => {
            console.log('Добавление обработчика для карточки', index + 1);
            
            card.addEventListener('click', function(event) {
                console.log('Клик по карточке закона', this.getAttribute('data-law'));
                event.stopPropagation();
                
                if (isLoading) {
                    alert(getTranslation('loading'));
                    return;
                }
                
                selectedLaw = parseInt(this.getAttribute('data-law'));
                console.log('Выбран закон:', selectedLaw);
                
                startTest(selectedLaw);
            });
        });
        
        // Обработчики для других кнопок
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', () => {
                showScreen(testSelectionScreen);
            });
        }
        
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', goToNextQuestion);
        }
        
        if (restartTestBtn) {
            restartTestBtn.addEventListener('click', () => {
                startTest(selectedLaw);
            });
        }
        
        if (newTestBtn) {
            newTestBtn.addEventListener('click', () => {
                showScreen(testSelectionScreen);
            });
        }
        
        // Обработчики переключения языка
        if (langKzBtn) {
            langKzBtn.addEventListener('click', () => {
                if (currentLanguage !== 'kz') {
                    switchLanguage('kz');
                }
            });
        }
        
        if (langRuBtn) {
            langRuBtn.addEventListener('click', () => {
                if (currentLanguage !== 'ru') {
                    switchLanguage('ru');
                }
            });
        }
        
        // Загружаем вопросы
        loadQuestions();
        
        // Показываем экран выбора теста
        showScreen(testSelectionScreen);
    }
    
    async function loadQuestions() {
        console.log('Загрузка вопросов для языка:', currentLanguage);
        isLoading = true;
        
        try {
            // Загружаем вопросы из JSON файла в зависимости от языка
            const filename = `questions_${currentLanguage}.json`;
            console.log('Попытка загрузить файл:', filename);
            
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }
            
            const allQuestionsData = await response.json();
            console.log('Вопросы успешно загружены:', allQuestionsData.length);
            
            // Группируем вопросы по законам
            allQuestionsByLaw = groupQuestionsByLaw(allQuestionsData);
            
            console.log('Вопросы по законам:', {
                1: allQuestionsByLaw[1].length,
                2: allQuestionsByLaw[2].length,
                3: allQuestionsByLaw[3].length,
                4: allQuestionsByLaw[4].length,
                5: allQuestionsByLaw[5].length
            });
            
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            
            // Создаем демо-вопросы для тестирования
            console.log('Создание демо-вопросов');
            const demoQuestions = generateDemoQuestions();
            allQuestionsByLaw = groupQuestionsByLaw(demoQuestions);
            
            // Временно показываем сообщение
            setTimeout(() => {
                alert(`Используются демо-вопросы. Для реальных вопросов создайте файл questions_${currentLanguage}.json`);
            }, 1000);
            
        } finally {
            isLoading = false;
            console.log('Загрузка вопросов завершена');
        }
    }
    
    function generateDemoQuestions() {
        // Создаем демо-вопросы для тестирования
        const demoQuestions = [];
        
        for (let law = 1; law <= 5; law++) {
            for (let i = 1; i <= 20; i++) {
                demoQuestions.push({
                    law: law,
                    question: `${currentLanguage === 'ru' ? 'Демо вопрос' : 'Демо сұрақ'} ${i} для закона ${law}`,
                    correctAnswer: `${currentLanguage === 'ru' ? 'Правильный ответ' : 'Дұрыс жауап'} ${i}`,
                    incorrectAnswers: [
                        `${currentLanguage === 'ru' ? 'Неправильный ответ' : 'Қате жауап'} 1`,
                        `${currentLanguage === 'ru' ? 'Неправильный ответ' : 'Қате жауап'} 2`,
                        `${currentLanguage === 'ru' ? 'Неправильный ответ' : 'Қате жауап'} 3`
                    ]
                });
            }
        }
        
        return demoQuestions;
    }
    
    function switchLanguage(lang) {
        console.log('Смена языка на:', lang);
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
        if (langKzBtn && langRuBtn) {
            if (currentLanguage === 'kz') {
                langKzBtn.classList.add('active');
                langRuBtn.classList.remove('active');
            } else {
                langKzBtn.classList.remove('active');
                langRuBtn.classList.add('active');
            }
        }
    }
    
    function updateInterfaceTexts() {
        // Обновляем все элементы с data-lang атрибутом
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    function getTranslation(key) {
        return translations[currentLanguage][key] || key;
    }
    
    function groupQuestionsByLaw(questions) {
        const grouped = {1: [], 2: [], 3: [], 4: [], 5: []};
        
        if (questions && Array.isArray(questions)) {
            questions.forEach(question => {
                const law = parseInt(question.law);
                if (law >= 1 && law <= 5) {
                    grouped[law].push(question);
                }
            });
        }
        
        return grouped;
    }
    
    function startTest(lawNumber) {
        console.log('Начало теста для закона:', lawNumber);
        
        // Получаем все вопросы для выбранного закона
        const allLawQuestions = allQuestionsByLaw[lawNumber] || [];
        
        // Проверяем, есть ли вопросы для выбранного закона
        if (allLawQuestions.length === 0) {
            alert(`${getTranslation('no_questions')} ${getTranslation('choose_another_law')}`);
            return;
        }
        
        // Проверяем, достаточно ли вопросов
        const questionsToTake = Math.min(QUESTIONS_PER_TEST, allLawQuestions.length);
        console.log(`Будет выбрано ${questionsToTake} вопросов из ${allLawQuestions.length} доступных`);
        
        // Выбираем случайные вопросы без повторений
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
        if (currentLawElement) {
            currentLawElement.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        }
        
        if (resultsLawName) {
            resultsLawName.innerHTML = `${getTranslation('law')} ${lawNumber}`;
        }
        
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = currentQuestions.length;
        }
        
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
        
        console.log(`Выбрано ${selectedQuestions.length} случайных вопросов`);
        return selectedQuestions;
    }
    
    function loadQuestion() {
        console.log('Загрузка вопроса', currentQuestionIndex + 1, 'из', currentQuestions.length);
        
        if (currentQuestionIndex >= currentQuestions.length) {
            showResults();
            return;
        }
        
        const question = currentQuestions[currentQuestionIndex];
        
        // Обновляем текст вопроса
        if (questionText) {
            questionText.textContent = question.question;
        }
        
        // Обновляем номер вопроса
        if (currentQuestionElement) {
            currentQuestionElement.textContent = currentQuestionIndex + 1;
        }
        
        // Обновляем прогресс
        if (progressFill) {
            const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
        
        // Очищаем контейнер с вариантами ответов
        if (optionsContainer) {
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
        }
        
        // Деактивируем кнопку "Следующий вопрос"
        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = true;
        }
    }
    
    function selectAnswer(selectedAnswer, correctAnswer) {
        console.log('Выбран ответ:', selectedAnswer);
        
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
        if (nextQuestionBtn) {
            nextQuestionBtn.disabled = false;
        }
        
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
        console.log('Показ результатов');
        
        // Подсчет результатов
        const correctAnswers = testResults.filter(r => r.isCorrect).length;
        const totalQuestions = testResults.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
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
        }
        
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
        if (!screen) return;
        
        // Скрыть все экраны
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        // Показать выбранный экран
        screen.classList.add('active');
        console.log('Показан экран:', screen.id);
    }
});