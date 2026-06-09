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
    boardType: 'CBSE',
    subscriptionPlan: { _id: '60f7c223405c102c98d6c810', name: 'Pro Plan', code: 'PRO' },
    maxStudents: 1500,
    isActive: true,
    isDeactive: false,
    country: 'India',
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
    boardType: 'ICSE',
    subscriptionPlan: { _id: '60f7c223405c102c98d6c811', name: 'Basic Plan', code: 'BASIC' },
    maxStudents: 800,
    isActive: true,
    isDeactive: false,
    country: 'India',
    settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export let mockSchoolsList = [...INITIAL_MOCK_SCHOOLS];

export const resetMockSchools = () => {
  mockSchoolsList = [...INITIAL_MOCK_SCHOOLS];
};

export const fetchStub = vi.fn((url: string | Request, options?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : url.url;
  const method = (options?.method || (typeof url === 'object' ? url.method : 'GET')).toUpperCase();
  try {
    if (urlString.includes('/api/users/login')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const email = body.email || 'aryan@schoolos.com';
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
        const body = options?.body ? JSON.parse(options.body as string) : {};
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: body
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
          let updateData = {};
          try {
            const bodyStr = options?.body || (typeof url === 'object' ? (url as unknown as { _bodyInit?: string })._bodyInit : undefined);
            if (bodyStr) {
              updateData = JSON.parse(bodyStr as string);
            }
          } catch (e) {
            // ignore
          }
          mockSchoolsList[schoolIndex] = {
            ...mockSchoolsList[schoolIndex],
            ...updateData
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
        let passcode = '';
        try {
          const bodyStr = options?.body || (typeof url === 'object' ? (url as unknown as { _bodyInit?: string })._bodyInit : undefined);
          if (bodyStr) {
            const body = JSON.parse(bodyStr as string);
            passcode = body.passcode;
          }
        } catch (e) {
          // ignore
        }

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

        try {
          const bodyStr = options?.body || (typeof url === 'object' ? (url as unknown as { _bodyInit?: string })._bodyInit : undefined);
          if (bodyStr) {
            const body = JSON.parse(bodyStr as string);
            if (body.name) name = body.name;
            if (body.code) code = body.code;
            if (body.subdomain) subdomain = body.subdomain;
            if (body.email) email = body.email;
            if (body.phone) phone = body.phone;
            if (body.subscriptionPlan) subscriptionPlan = body.subscriptionPlan;
          }
        } catch (e) {
          // ignore body parsing errors
        }

        const newSchool = {
          _id: 'school-mock-new',
          name,
          code,
          subdomain,
          email,
          phone,
          countryCode: '+91',
          boardType: 'CBSE',
          subscriptionPlan: { _id: subscriptionPlan, name: 'Pro Plan', code: 'PRO' },
          maxStudents: 500,
          isActive: true,
          isDeactive: false,
          country: 'India',
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
