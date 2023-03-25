from django.shortcuts import render
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse
from questions.models import Question, Answer
from results.models import Result


class QuizListView(ListView):
    model = Quiz
    template_name = 'quizes/main.html'

def quiz_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    return render(request, 'quizes/quiz.html', {'obj': quiz})

def quiz_data_view(request, pk):
    quizObj = Quiz.objects.get(pk=pk)
    quiz = []
    # get all questions of the specific quiz
    for q in quizObj.get_questions():
        answers = []
        # for each question get all answers
        for a in q.get_answers():
            # append the answer text to a temp list
            answers.append(a.text)
        # add each question with relevant answers as a key-value pairs
        quiz.append({str(q): answers})
    return JsonResponse({
        'data': quiz,
        'time': quizObj.time,
    })

def save_quiz_view(request, pk):
    if request.POST:
        # get the data and convert it from QueryDict to python dict
        data = dict(request.POST)
        data.pop('csrfmiddlewaretoken')
        
        quiz = Quiz.objects.get(pk=pk)
        user = request.user

        # get questions objects
        questions = [Question.objects.get(text=k) for k in data.keys()]
        # get selected answers
        selected_answers = [a[0] for a in data.values()]

        results = []
        score = 0
        for i, question in enumerate(questions):
            correct_answer = Answer.objects.get(question=question, correct=True).text
            selected_answer = selected_answers[i]
            if selected_answer == correct_answer:
                score += 1
            results.append(
                {str(question): 
                    {   'correct_answer': correct_answer, 
                        'selected_answer': selected_answer if selected_answer != '' else 'not answered'
                    }
                }
            )

        score *= (100 / quiz.number_of_questions)
        Result.objects.create(quiz=quiz, user=user, score=score)
        print(score)

        required_score = quiz.required_score_to_pass

        if score >= required_score:
            return JsonResponse({'passed': True, 'score': score, 'results': results})

        return JsonResponse({'passed': False, 'score': score, 'results': results})

