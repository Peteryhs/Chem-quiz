// Question Database
const elements = [
    // First 20 Elements
    { name: 'Hydrogen', symbol: 'H', protons: 1, neutrons: 0 },
    { name: 'Helium', symbol: 'He', protons: 2, neutrons: 2 },
    { name: 'Lithium', symbol: 'Li', protons: 3, neutrons: 4 },
    { name: 'Beryllium', symbol: 'Be', protons: 4, neutrons: 5 },
    { name: 'Boron', symbol: 'B', protons: 5, neutrons: 6 },
    { name: 'Carbon', symbol: 'C', protons: 6, neutrons: 6 },
    { name: 'Nitrogen', symbol: 'N', protons: 7, neutrons: 7 },
    { name: 'Oxygen', symbol: 'O', protons: 8, neutrons: 8 },
    { name: 'Fluorine', symbol: 'F', protons: 9, neutrons: 10 },
    { name: 'Neon', symbol: 'Ne', protons: 10, neutrons: 10 },
    { name: 'Sodium', symbol: 'Na', protons: 11, neutrons: 12 },
    { name: 'Magnesium', symbol: 'Mg', protons: 12, neutrons: 12 },
    { name: 'Aluminum', symbol: 'Al', protons: 13, neutrons: 14 },
    { name: 'Silicon', symbol: 'Si', protons: 14, neutrons: 14 },
    { name: 'Phosphorus', symbol: 'P', protons: 15, neutrons: 16 },
    { name: 'Sulfur', symbol: 'S', protons: 16, neutrons: 16 },
    { name: 'Chlorine', symbol: 'Cl', protons: 17, neutrons: 18 },
    { name: 'Argon', symbol: 'Ar', protons: 18, neutrons: 22 },
    { name: 'Potassium', symbol: 'K', protons: 19, neutrons: 20 },
    { name: 'Calcium', symbol: 'Ca', protons: 20, neutrons: 20 },
    
    // Additional Commonly Encountered Elements
    { name: 'Iron', symbol: 'Fe', protons: 26, neutrons: 30 },
    { name: 'Lead', symbol: 'Pb', protons: 82, neutrons: 125 },
    { name: 'Copper', symbol: 'Cu', protons: 29, neutrons: 35 },
    { name: 'Silver', symbol: 'Ag', protons: 47, neutrons: 61 },
    { name: 'Mercury', symbol: 'Hg', protons: 80, neutrons: 121 },
];

// Generate Question Database
let questionDB = [];

// Function to add questions to the database
function generateQuestions() {
    elements.forEach(element => {
        // Symbol to Name
        questionDB.push({
            type: 'symbol-to-name',
            question: `What is the name of the element with the symbol "${element.symbol}"?`,
            answer: element.name
        });

        // Name to Symbol
        questionDB.push({
            type: 'name-to-symbol',
            question: `What is the symbol for "${element.name}"?`,
            answer: element.symbol
        });

        // Number of Protons
        questionDB.push({
            type: 'protons',
            question: `How many protons does ${element.name} have?`,
            answer: element.protons.toString()
        });

        // Number of Neutrons
        questionDB.push({
            type: 'neutrons',
            question: `How many neutrons does ${element.name} have?`,
            answer: element.neutrons.toString()
        });
    });
}

// Initialize Question Database
generateQuestions();

// Quiz Variables
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let fuzzyMatchingEnabled = false;

// DOM Elements
const startBtn = document.getElementById('start-quiz');
const restartBtn = document.getElementById('restart-quiz');
const numQuestionsInput = document.getElementById('num-questions');
const qtypeInputs = document.querySelectorAll('input[name="qtype"]');
const settingsDiv = document.querySelector('.settings');
const quizContainer = document.querySelector('.quiz-container');
const questionNumberDiv = document.getElementById('question-number');
const questionTextDiv = document.getElementById('question-text');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-answer');
const feedbackDiv = document.getElementById('feedback');
const resultsDiv = document.querySelector('.results');
const scoreP = document.getElementById('score');
const fuzzyMatchingCheckbox = document.getElementById('fuzzy-matching');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Event Listeners
startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitAnswer);
restartBtn.addEventListener('click', restartQuiz);
answerInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
});
darkModeToggle.addEventListener('change', toggleDarkMode);

// Start Quiz Function
function startQuiz() {
    // Get user settings
    const numQuestions = parseInt(numQuestionsInput.value);
    const selectedTypes = Array.from(qtypeInputs)
        .filter(input => input.checked)
        .map(input => input.value);
    fuzzyMatchingEnabled = fuzzyMatchingCheckbox.checked;

    if (selectedTypes.length === 0) {
        alert('Please select at least one question type.');
        return;
    }

    // Filter questions based on selected types
    const availableQuestions = questionDB.filter(q => selectedTypes.includes(q.type));

    if (availableQuestions.length < numQuestions) {
        alert(`Only ${availableQuestions.length} questions available for the selected types.`);
        return;
    }

    // Shuffle and select questions
    selectedQuestions = shuffleArray(availableQuestions).slice(0, numQuestions);
    currentQuestionIndex = 0;
    score = 0;

    // Hide settings and show quiz
    settingsDiv.style.display = 'none';
    resultsDiv.style.display = 'none';
    quizContainer.style.display = 'block';

    displayQuestion();
}

// Display Current Question
function displayQuestion() {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    questionNumberDiv.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    questionTextDiv.textContent = currentQuestion.question;
    answerInput.value = '';
    feedbackDiv.textContent = '';
    answerInput.focus();
}

// Submit Answer
function submitAnswer() {
    const userAnswer = answerInput.value.trim();
    if (userAnswer === '') {
        alert('Please enter an answer.');
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    let correct = false;
    let closeEnough = false;

    // For case-insensitive comparison
    if (currentQuestion.type.includes('symbol') || currentQuestion.type.includes('name')) {
        if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
            correct = true;
        } else if (fuzzyMatchingEnabled) {
            if (isCloseEnough(userAnswer.toLowerCase(), currentQuestion.answer.toLowerCase())) {
                closeEnough = true;
            }
        }
    } else {
        // For numeric answers
        if (parseInt(userAnswer) === parseInt(currentQuestion.answer)) {
            correct = true;
        } else if (fuzzyMatchingEnabled) {
            // For numbers, allow a small difference (e.g., +/-1)
            const userNum = parseInt(userAnswer);
            const correctNum = parseInt(currentQuestion.answer);
            if (Math.abs(userNum - correctNum) <= 1) {
                closeEnough = true;
            }
        }
    }

    if (correct) {
        score++;
        feedbackDiv.textContent = 'Correct!';
        feedbackDiv.style.color = 'var(--feedback-correct)';
        feedbackDiv.classList.add('animate-feedback');
    } else if (closeEnough) {
        feedbackDiv.textContent = `Almost! The correct answer was "${currentQuestion.answer}".`;
        feedbackDiv.style.color = 'orange';
        feedbackDiv.classList.add('animate-feedback');
    } else {
        feedbackDiv.textContent = `Incorrect! The correct answer was "${currentQuestion.answer}".`;
        feedbackDiv.style.color = 'var(--feedback-incorrect)';
        feedbackDiv.classList.add('animate-feedback');
    }

    // Remove animation class after animation completes to allow re-animation
    feedbackDiv.addEventListener('animationend', () => {
        feedbackDiv.classList.remove('animate-feedback');
    }, { once: true });

    // Move to next question after a short delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < selectedQuestions.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// End Quiz
function endQuiz() {
    quizContainer.style.display = 'none';
    resultsDiv.style.display = 'block';
    scoreP.textContent = `You scored ${score} out of ${selectedQuestions.length}.`;

    // Check for perfect score
    if (score === selectedQuestions.length) {
        triggerConfetti();
    }
}

// Restart Quiz
function restartQuiz() {
    resultsDiv.style.display = 'none';
    settingsDiv.style.display = 'block';
}

// Utility Function to Shuffle Array
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load Dark Mode preference on page load
window.onload = () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
};
// Fuzzy Matching Function (Levenshtein Distance)
function isCloseEnough(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    const similarity = (maxLength - distance) / maxLength;
    return similarity >= 0.8; // 80% similarity threshold
}

// Levenshtein Distance Algorithm
function levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,    // Deletion
                    matrix[i][j - 1] + 1,    // Insertion
                    matrix[i - 1][j - 1] + 1 // Substitution
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Easter Egg: Confetti
function triggerConfetti() {
    // Using canvas-confetti library
    confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
    });
}

const progressBar = document.getElementById('progress-bar');

function displayQuestion() {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    questionNumberDiv.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    questionTextDiv.textContent = currentQuestion.question;
    answerInput.value = '';
    feedbackDiv.textContent = '';
    answerInput.focus();
    
    // Update Progress Bar
    const progressPercentage = ((currentQuestionIndex) / selectedQuestions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function endQuiz() {
    // Set progress bar to 100%
    progressBar.style.width = `100%`;
    quizContainer.style.display = 'none';
    resultsDiv.style.display = 'block';
    scoreP.textContent = `You scored ${score} out of ${selectedQuestions.length}.`;

    // Check for perfect score
    if (score === selectedQuestions.length) {
        triggerConfetti();
    }
}
