'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BaseURL } from '@/lib/util';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    desiredField: '',
    desiredCompany: '',
    experience: '',
    education: '',
    skills: [] as string[]
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/api/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          profileData: {
            age: parseInt(formData.age),
            desiredField: formData.desiredField,
            desiredCompany: formData.desiredCompany,
            experience: formData.experience,
            education: formData.education,
            skills: formData.skills
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 사용자 정보 업데이트
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        localStorage.setItem('userInfo', JSON.stringify({
          ...userInfo,
          onboardingCompleted: true
        }));

        router.push('/dashboard');
      } else {
        setError(data.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                기본 정보를 알려주세요
              </h2>
              <p className="text-sm text-gray-500">
                맞춤형 면접 준비를 위해 필요합니다
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  나이
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  placeholder="예: 25"
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  희망 분야
                </label>
                <select
                  name="desiredField"
                  value={formData.desiredField}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="">선택해주세요</option>
                  <option value="프론트엔드 개발">프론트엔드 개발</option>
                  <option value="백엔드 개발">백엔드 개발</option>
                  <option value="풀스택 개발">풀스택 개발</option>
                  <option value="데이터 사이언스">데이터 사이언스</option>
                  <option value="AI/ML 엔지니어">AI/ML 엔지니어</option>
                  <option value="DevOps">DevOps</option>
                  <option value="모바일 개발">모바일 개발</option>
                  <option value="게임 개발">게임 개발</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  희망 회사
                </label>
                <input
                  type="text"
                  name="desiredCompany"
                  value={formData.desiredCompany}
                  onChange={handleChange}
                  placeholder="예: 카카오, 네이버, 삼성전자"
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                경력과 학력을 알려주세요
              </h2>
              <p className="text-sm text-gray-500">
                면접 난이도를 조절하는데 도움이 됩니다
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경력
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="">선택해주세요</option>
                  <option value="신입">신입 (0년)</option>
                  <option value="1년">1년</option>
                  <option value="2년">2년</option>
                  <option value="3년">3년</option>
                  <option value="4년">4년</option>
                  <option value="5년">5년</option>
                  <option value="5년 이상">5년 이상</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최종 학력
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
                >
                  <option value="">선택해주세요</option>
                  <option value="고등학교 졸업">고등학교 졸업</option>
                  <option value="대학교 재학">대학교 재학</option>
                  <option value="대학교 졸업">대학교 졸업</option>
                  <option value="대학원 재학">대학원 재학</option>
                  <option value="대학원 졸업">대학원 졸업</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                보유 기술을 알려주세요
              </h2>
              <p className="text-sm text-gray-500">
                기술 면접 문제를 맞춤형으로 제공해드립니다
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기술 스택 (엔터를 눌러 추가)
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="예: React, Node.js, Python"
                  className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200 transition-colors"
                >
                  추가
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가된 기술
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.desiredField && formData.desiredCompany;
      case 2:
        return formData.experience && formData.education;
      case 3:
        return formData.skills.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* 프로그레스 바 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">진행률</span>
            <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm mb-6">
              {error}
            </div>
          )}

          {renderStep()}

          {/* 버튼 */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || isLoading}
                className="px-6 py-2 bg-gray-900 text-white rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '완료 중...' : '완료'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-gray-900 text-white rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            )}
          </div>
        </div>

        {/* 하단 텍스트 */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            © 2024 BUMAVIEW. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
