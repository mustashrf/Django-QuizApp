from django.db import models
import random

# Create your models here.

DIFFICULTY_CHOICES = (
    ('easy', 'easy'),
    ('medium', 'medium'),
    ('hard', 'hard'),
)

class Quiz(models.Model):
    name = models.CharField(max_length=120)
    topic = models.CharField(max_length=120)
    number_of_questions = models.IntegerField()
    time = models.IntegerField(help_text='duration of the quiz in minutes')
    required_score_to_pass = models.IntegerField(help_text='required score in %')
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.name}-{self.topic}'

    def get_questions(self):
        # return a randomized list of questions so that it's length == the quiz's specified number of questions
        questions = list(self.question_set.all())
        random.shuffle(questions)
        return questions[:self.number_of_questions]

    class Meta:
        verbose_name_plural = 'Quizes'