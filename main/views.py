from django.shortcuts import render

def error(request, exception=None):
    return render(request, 'error.html')