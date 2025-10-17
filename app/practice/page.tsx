'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useInterviewStore } from '@/store/interview.store';
import { useQuestionStore } from '@/store/question.store';
import { questionService } from '@/services/question.service';
import { interviewService } from '@/services/interview.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { formatTime } from '@/lib/utils';

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentInterview, currentQuestionIndex, answers, isInterviewActive, setCurrentInterview, setCurrentQuestionIndex, setAnswer, setIsInterviewActive, clearInterview } = useInterviewStore();
  const { questions, setQuestions, setCurrentQuestion, setLoading } = useQuestionStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: '',
    category: '',
    count: 5,
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchQuestions();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isInterviewActive && currentInterview) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, isInterviewActive, currentInterview]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions({ page: 0, size: 100 });
      setQuestions(response.content);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    if (!interviewForm.title || !interviewForm.category) {
      alert('제목과 카테고리를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await interviewService.createMockInterview(interviewForm);
      setCurrentInterview(response);
      setIsInterviewActive(true);
      setCurrentQuestionIndex(0);
      setShowCreateModal(false);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Failed to create interview:', error);
      alert('면접 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentInterview || !currentAnswer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const questionId = currentInterview.questions[currentQuestionIndex].id;

    try {
      await interviewService.recordAnswer(currentInterview.id, {
        questionId,
        answer: currentAnswer,
        timeSpent,
      });

      setAnswer(questionId, currentAnswer, timeSpent);
      setCurrentAnswer('');

      if (currentQuestionIndex < currentInterview.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        // 면접 완료
        await handleFinishInterview();
      }
    } catch (error) {
      console.error('Failed to record answer:', error);
      alert('답변 저장에 실패했습니다.');
    }
  };

  const handleFinishInterview = async () => {
    if (!currentInterview) return;

    try {
      const result = await interviewService.finishInterview(currentInterview.id);
      setIsInterviewActive(false);
      clearInterview();
      alert(`면접이 완료되었습니다!\n총 문제: ${result.summary.totalQuestions}개\n총 시간: ${Math.floor(result.summary.totalTimeSpent / 60)}분 ${result.summary.totalTimeSpent % 60}초\n평균 시간: ${Math.floor(result.summary.average / 60)}분 ${Math.floor(result.summary.average % 60)}초`);
    } catch (error) {
      console.error('Failed to finish interview:', error);
      alert('면접 완료 처리에 실패했습니다.');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < currentInterview!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setQuestionStartTime(Date.now());
    } else {
      handleFinishInterview();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!isInterviewActive ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">면접 연습</h1>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>새로운 면접 시작</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                모의면접을 시작하여 실전 경험을 쌓아보세요.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full"
              >
                면접 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interview Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{currentInterview?.title}</h2>
                <div className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} / {currentInterview?.questions.length}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / currentInterview!.questions.length) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle>문제 {currentQuestionIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-900 mb-6">
                {currentInterview?.questions[currentQuestionIndex]?.question}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder="답변을 입력하세요..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim()}
                    className="flex-1"
                  >
                    {currentQuestionIndex < currentInterview!.questions.length - 1 ? '다음 문제' : '면접 완료'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkipQuestion}
                  >
                    건너뛰기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Interview Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="면접 설정"
      >
        <div className="space-y-4">
          <Input
            label="면접 제목"
            value={interviewForm.title}
            onChange={(e) => setInterviewForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="예: 프론트엔드 개발자 면접"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={interviewForm.category}
              onChange={(e) => setInterviewForm(prev => ({ ...prev, category: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">카테고리 선택</option>
              <option value="back">백엔드</option>
              <option value="front">프론트엔드</option>
              <option value="ai">AI</option>
              <option value="bank">은행</option>
              <option value="game">게임</option>
              <option value="design">디자인</option>
              <option value="security">보안</option>
              <option value="infra">인프라</option>
              <option value="embedded">임베디드</option>
            </select>
          </div>

          <Input
            label="문제 수"
            type="number"
            value={interviewForm.count}
            onChange={(e) => setInterviewForm(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
            min="1"
            max="20"
          />

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleCreateInterview}
              loading={isLoading}
              className="flex-1"
            >
              면접 시작
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}