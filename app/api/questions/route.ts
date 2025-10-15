import { NextRequest, NextResponse } from 'next/server';
import * as question from '@/types/question';

// 임시 질문 데이터
const mockQuestions: question.Question[] = [
  {
    id: 1,
    question: 'React의 주요 특징은 무엇인가요?',
    company: '네이버',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 2,
    question: 'JavaScript의 클로저란 무엇인가요?',
    company: '카카오',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 3,
    question: '자기소개를 해주세요.',
    company: '구글',
    year: 2024,
    category: '인성면접'
  },
  {
    id: 4,
    question: 'TypeScript를 사용하는 이유는 무엇인가요?',
    company: '토스',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 5,
    question: '팀워크 경험에 대해 말해주세요.',
    company: '라인',
    year: 2024,
    category: '인성면접'
  },
  {
    id: 6,
    question: 'Node.js의 이벤트 루프에 대해 설명해주세요.',
    company: '당근마켓',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 7,
    question: '프로젝트에서 가장 어려웠던 점은 무엇인가요?',
    company: '쿠팡',
    year: 2024,
    category: '인성면접'
  },
  {
    id: 8,
    question: '데이터베이스 정규화란 무엇인가요?',
    company: '배민',
    year: 2024,
    category: '기술면접'
  }
];

// let nextQuestionId = 9; // 사용하지 않음

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '10');

    let filteredQuestions = mockQuestions;

    // 검색어가 있으면 필터링
    if (query) {
      filteredQuestions = mockQuestions.filter(q => 
        q.question.toLowerCase().includes(query.toLowerCase()) ||
        q.company.toLowerCase().includes(query.toLowerCase()) ||
        q.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 페이지네이션
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    const response: question.SearchAllQuestionResponse = {
      questions: paginatedQuestions,
      pageable: {
        pageNumber: page - 1,
        pageSize: size,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true
        },
        offset: startIndex,
        paged: true,
        unpaged: false
      },
      totalElements: filteredQuestions.length,
      totalPages: Math.ceil(filteredQuestions.length / size),
      last: endIndex >= filteredQuestions.length,
      first: page === 1,
      size: size,
      number: page - 1,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true
      },
      numberOfElements: paginatedQuestions.length,
      empty: paginatedQuestions.length === 0
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
