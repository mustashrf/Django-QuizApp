const url = window.location.href

const quizBox = document.getElementById('quiz-box')
const scoreBox = document.getElementById('score-box')
const resultBox = document.getElementById('result-box')
const timerBox = document.getElementById('timer-box')

let countdownInterval
const activateTimer = (timeInMinutes)=>{
    let seconds = timeInMinutes * 60;
    countdownInterval = setInterval(() => {
        seconds--;
        const minutesLeft = Math.floor(seconds / 60);
        const secondsLeft = seconds % 60;
        timerBox.innerHTML = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            timerBox.innerHTML = 'Time is up!'
            sendData()
        }
    }, 1000);
}

const stopTimer = () => {
    clearInterval(countdownInterval);
}

// build the quiz form
$.ajax({
    type: 'GET',
    url: `${url}data`,
    success: function (response) {
        const data = response.data
        data.forEach(element => {
            for(const [question, answers] of Object.entries(element)){
                quizBox.innerHTML += `
                    <hr>
                    <div class="mb-2">
                        <b>${question}</b>
                    </div>
                `
                answers.forEach(answer =>{
                    quizBox.innerHTML += `
                        <div>
                            <input type="radio" class="ans" id="${question}-${answer}" name="${question}" value="${answer}">
                            <label for="${question}">${answer}</label>
                        </div>
                    `
                })
            }
        });
        activateTimer(response.time)
    },
    error: function (error) {
        console.log(error)
    }
})

const quizForm = document.getElementById('quiz-form')
const csrf = document.getElementsByName('csrfmiddlewaretoken')

const sendData = () =>{
    const answers = [...document.getElementsByClassName('ans')]
    const data = {}
    data['csrfmiddlewaretoken'] = csrf[0].value
    answers.forEach(answer => {
        if (answer.checked) {
            data[answer.name] = answer.value
        }
        else{
            if (!data[answer.name]) {
                data[answer.name] = null
            }
        }
    })
    $.ajax({
        type: 'POST',
        url: `${url}save`,
        data: data,
        success: function(response) {
            const results = response.results
            quizForm.classList.add('not-visible')

            scoreBox.innerHTML += `${response.passed ? 'Congratulations! ' : 'Oops :( '} Your result is ${response.score.toFixed(2)}%`

            results.forEach(result=>{

                const resDiv = document.createElement('div')
                
                for(const[question, resp] of Object.entries(result)){
                    
                    resDiv.innerHTML += question
                    cls = ['container' ,'p-3', 'text-light', 'h3']
                    resDiv.classList.add(...cls)

                    const selected_answer = resp['selected_answer']
                    const correct_answer = resp['correct_answer']
                    
                    if (selected_answer == 'not answered') {
                        resDiv.innerHTML += ': not answered'
                        resDiv.classList.add('bg-danger')
                    }
                    else{
                        resDiv.innerHTML += `: answered: ${selected_answer}`
                        if (selected_answer == correct_answer) {
                            resDiv.classList.add('bg-success')
                        }
                        else{
                            resDiv.classList.add('bg-danger')
                            // resDiv.innerHTML += `answered: ${selected_answer}`
                            resDiv.innerHTML += ` | correct_answer: ${correct_answer}`
                        }
                    }
                    resultBox.append(resDiv)

                }

            })

        },
        error: function(error) {
            console.log(error)
        }
    })
}

quizForm.addEventListener('submit', e=>{
    e.preventDefault()
    stopTimer()
    sendData()
})