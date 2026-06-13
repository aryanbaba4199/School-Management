import { vi } from 'vitest';

export const INITIAL_MOCK_SCHOOLS = [
  {
    _id: '60f7c223405c102c98d6c801',
    name: 'Greenwood International School',
    code: 'GWIS',
    subdomain: 'greenwood',
    email: 'info@greenwood.edu',
    phone: '9876543210',
    countryCode: '+91',
    boardType: { _id: '60f7c223405c102c98d6c830', name: 'Central Board of Secondary Education', acronym: 'CBSE' },
    subscriptionPlan: { _id: '60f7c223405c102c98d6c810', name: 'Pro Plan', code: 'PRO' },
    maxStudents: 1500,
    isActive: true,
    isDeactive: false,
    country: { _id: '60f7c223405c102c98d6c840', name: 'India' },
    settings: { attendanceEnabled: true, onlineExamEnabled: true, aiAnalyticsEnabled: true, parentAppEnabled: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '60f7c223405c102c98d6c802',
    name: 'Saint Xavier Academy',
    code: 'SXAC',
    subdomain: 'stxaviers',
    email: 'contact@stxaviers.org',
    phone: '8765432109',
    countryCode: '+91',
    boardType: { _id: '60f7c223405c102c98d6c831', name: 'Indian Certificate of Secondary Education', acronym: 'ICSE' },
    subscriptionPlan: { _id: '60f7c223405c102c98d6c811', name: 'Basic Plan', code: 'BASIC' },
    maxStudents: 800,
    isActive: true,
    isDeactive: false,
    country: { _id: '60f7c223405c102c98d6c840', name: 'India' },
    settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export let mockSchoolsList = [...INITIAL_MOCK_SCHOOLS];

export let mockUsersList = [
  {
    _id: 'user-stu-1',
    name: 'Aryan Student',
    email: 'aryanstudent@school.com',
    userCode: 'STU-001',
    role: { name: 'STUDENT', access: ['READ'] },
    schoolId: '60f7c223405c102c98d6c801',
    classId: { _id: 'class-1', name: 'Class 10' },
    isActive: true,
  }
];

export let mockFeesList = [
  {
    _id: 'fee-1',
    studentId: { _id: 'user-stu-1', name: 'Aryan Student', userCode: 'STU-001' },
    classId: { _id: 'class-1', name: 'Class 10' },
    amount: 5000,
    type: 'ADMISSION',
    status: 'PENDING',
    year: 2024,
    createdAt: new Date().toISOString(),
  }
];

export const resetMockSchools = () => {
  mockSchoolsList = [...INITIAL_MOCK_SCHOOLS];
  mockUsersList = [
    {
      _id: 'user-stu-1',
      name: 'Aryan Student',
      email: 'aryanstudent@school.com',
      userCode: 'STU-001',
      role: { name: 'STUDENT', access: ['READ'] },
      schoolId: '60f7c223405c102c98d6c801',
      classId: { _id: 'class-1', name: 'Class 10' },
      isActive: true,
    }
  ];
  mockFeesList = [
    {
      _id: 'fee-1',
      studentId: { _id: 'user-stu-1', name: 'Aryan Student', userCode: 'STU-001' },
      classId: { _id: 'class-1', name: 'Class 10' },
      amount: 5000,
      type: 'ADMISSION',
      status: 'PENDING',
      year: 2024,
      createdAt: new Date().toISOString(),
    }
  ];
};

export const fetchStub = vi.fn(async (url: string | Request, options?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : url.url;
  const method = (options?.method || (typeof url === 'object' ? url.method : 'GET')).toUpperCase();

  let parsedBody: {
    email?: string;
    passcode?: string;
    name?: string;
    code?: string;
    subdomain?: string;
    phone?: string;
    subscriptionPlan?: string;
    role?: unknown;
  } | null = null;
  try {
    if (options?.body) {
      parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } else if (typeof url === 'object' && url.clone) {
      const text = await url.clone().text();
      if (text) parsedBody = JSON.parse(text);
    }
  } catch {
    // ignore
  }

  try {
    if (urlString.includes('/api/users/login')) {
      const email = parsedBody?.email || 'aryan@schoolos.com';
      const roleName = email.includes('admin') || email.includes('aryan') ? 'SUPER_ADMIN' : email.includes('teacher') ? 'TEACHER' : 'STUDENT';
      const label = email.includes('admin') || email.includes('aryan') ? 'Admin' : email.includes('teacher') ? 'Teacher' : 'Student';

      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            _id: 'mock-user-id',
            name: `Demo ${label}`,
            email: email,
            userCode: roleName === 'SUPER_ADMIN' ? 'SA-01' : roleName === 'TEACHER' ? 'T-202' : 'ST-505',
            role: { name: roleName, access: roleName === 'SUPER_ADMIN' ? ['ALL'] : ['READ'] },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    if (urlString.includes('/api/schools/drafts')) {
      if (method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: parsedBody || {}
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      } else {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: null
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
    }

    if (urlString.includes('/api/schools')) {
      if (urlString.includes('/deactivate') && method === 'PATCH') {
        const match = urlString.match(/\/schools\/([^/]+)\/deactivate/);
        const id = match ? match[1] : null;
        const schoolIndex = mockSchoolsList.findIndex(s => s._id === id);
        if (schoolIndex !== -1) {
          mockSchoolsList[schoolIndex] = {
            ...mockSchoolsList[schoolIndex],
            isDeactive: !mockSchoolsList[schoolIndex].isDeactive
          };
          return Promise.resolve(new Response(JSON.stringify({
            success: true,
            data: mockSchoolsList[schoolIndex]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return Promise.resolve(new Response(JSON.stringify({
          success: false,
          message: 'School not found'
        }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
      }

      if (method === 'PUT') {
        const match = urlString.match(/\/schools\/([^/]+)$/);
        const id = match ? match[1] : null;
        const schoolIndex = mockSchoolsList.findIndex(s => s._id === id);
        if (schoolIndex !== -1) {
          const updateData = parsedBody || {};
          const existingPlan = mockSchoolsList[schoolIndex].subscriptionPlan;
          const updatedPlan = typeof updateData.subscriptionPlan === 'string'
            ? { _id: updateData.subscriptionPlan, name: 'Pro Plan', code: 'PRO' }
            : existingPlan;

          mockSchoolsList[schoolIndex] = {
            ...mockSchoolsList[schoolIndex],
            ...updateData,
            subscriptionPlan: updatedPlan
          };
          return Promise.resolve(new Response(JSON.stringify({
            success: true,
            data: mockSchoolsList[schoolIndex]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return Promise.resolve(new Response(JSON.stringify({
          success: false,
          message: 'School not found'
        }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
      }

      if (method === 'DELETE') {
        const match = urlString.match(/\/schools\/([^/]+)$/);
        const id = match ? match[1] : null;
        const passcode = parsedBody?.passcode || '';

        if (passcode !== '727798') {
          return Promise.resolve(new Response(JSON.stringify({
            success: false,
            message: 'Invalid master passcode'
          }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
        }

        const schoolIndex = mockSchoolsList.findIndex(s => s._id === id);
        if (schoolIndex !== -1) {
          if (!mockSchoolsList[schoolIndex].isDeactive) {
            return Promise.resolve(new Response(JSON.stringify({
              success: false,
              message: 'School must be deactivated before deletion'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
          }
          mockSchoolsList.splice(schoolIndex, 1);
          return Promise.resolve(new Response(JSON.stringify({
            success: true,
            message: 'School deleted successfully'
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return Promise.resolve(new Response(JSON.stringify({
          success: false,
          message: 'School not found'
        }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
      }

      if (method === 'POST') {
        let name = 'New Test School';
        let code = 'NTSC';
        let subdomain = 'ntsc';
        let email = 'test@schoolos.com';
        let phone = '1234567890';
        let subscriptionPlan = '60f7c223405c102c98d6c810';

        if (parsedBody) {
          if (parsedBody.name) name = parsedBody.name;
          if (parsedBody.code) code = parsedBody.code;
          if (parsedBody.subdomain) subdomain = parsedBody.subdomain;
          if (parsedBody.email) email = parsedBody.email;
          if (parsedBody.phone) phone = parsedBody.phone;
          if (parsedBody.subscriptionPlan) subscriptionPlan = parsedBody.subscriptionPlan;
        }

        const newSchool = {
          _id: 'school-mock-new',
          name,
          code,
          subdomain,
          email,
          phone,
          countryCode: '+91',
          boardType: { _id: '60f7c223405c102c98d6c830', name: 'Central Board of Secondary Education', acronym: 'CBSE' },
          subscriptionPlan: { _id: subscriptionPlan, name: 'Pro Plan', code: 'PRO' },
          maxStudents: 500,
          isActive: true,
          isDeactive: false,
          country: { _id: '60f7c223405c102c98d6c840', name: 'India' },
          settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockSchoolsList.push(newSchool);

        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: newSchool
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      } else {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: mockSchoolsList
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
    }

    if (urlString.includes('/api/classes')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: [{ _id: 'class-1', name: 'Class 10' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    if (urlString.includes('/api/users') && !urlString.includes('login')) {
      if (method === 'POST') {
        const newUser = {
          _id: `user-mock-new-${Date.now()}`,
          ...parsedBody,
          role: parsedBody && 'role' in parsedBody ? (parsedBody as { role: unknown }).role : { name: 'STUDENT' },
          createdAt: new Date().toISOString()
        };
        // @ts-expect-error Mock data type mismatch
        mockUsersList.push(newUser);
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: newUser
        }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
      } else if (urlString.includes('/api/users/profile')) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: mockUsersList[0]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      } else {
        const urlObj = new URL(urlString, 'http://localhost');
        const role = urlObj.searchParams.get('role');
        const filtered = role ? mockUsersList.filter(u => u.role.name === role) : mockUsersList;
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: filtered,
          pagination: { total: filtered.length, page: 1, limit: 10, totalPages: 1 }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
    }

    if (urlString.includes('/api/fees')) {
      if (urlString.includes('/transactions')) {
        const url = new URL(urlString, 'http://localhost');
        const status = url.searchParams.get('status');
        let data = mockFeesList;
        
        if (status === 'DUE') {
          data = mockFeesList.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE');
        } else if (status) {
          data = mockFeesList.filter(f => f.status === status);
        }

        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlString.includes('/student/')) {
        const studentId = urlString.split('/').pop();
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: mockFeesList.filter((f: { studentId: { _id: string } | string }) => typeof f.studentId === 'object' ? f.studentId._id === studentId : f.studentId === studentId)
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlString.includes('/generate-bulk')) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          count: 5,
          message: 'Fees generated successfully'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlString.includes('/cycle/')) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: mockFeesList
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (urlString.includes('/pay-receipt')) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          data: { walletAdded: 0 }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
    }

    if (urlString.includes('/api/masters/subscription-plans')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: [{ _id: '60f7c223405c102c98d6c810', name: 'Pro Plan' }, { _id: '60f7c223405c102c98d6c811', name: 'Basic Plan' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    if (urlString.includes('/api/masters/states')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: [{ _id: '60f7c223405c102c98d6c820', name: 'Karnataka' }, { _id: '60f7c223405c102c98d6c821', name: 'Delhi' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    if (urlString.includes('/api/masters/countries')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: [{ _id: '60f7c223405c102c98d6c840', name: 'India', dialCode: '+91', mobileDigits: 10 }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    if (urlString.includes('/api/masters/board-types')) {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        data: [
          { _id: '60f7c223405c102c98d6c830', name: 'Central Board of Secondary Education', acronym: 'CBSE' },
          { _id: '60f7c223405c102c98d6c831', name: 'Indian Certificate of Secondary Education', acronym: 'ICSE' }
        ]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    return Promise.resolve(new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('fetchStub error for URL:', urlString, error);
    return Promise.reject(error);
  }
});

vi.stubGlobal('fetch', fetchStub);
