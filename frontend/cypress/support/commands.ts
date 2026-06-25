/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT', customUser?: any): Chainable<void>;
    mockApi(fixtureMap: Record<string, string>): Chainable<void>;
  }
}

Cypress.Commands.add('login', (role, customUser) => {
  const defaultUsers = {
    SUPER_ADMIN: {
      _id: 'sa_1',
      name: 'Super Admin',
      email: 'admin@school.com',
      role: { name: 'SUPER_ADMIN', access: [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    SCHOOL_ADMIN: {
      _id: 'sca_1',
      name: 'School Admin',
      email: 'schooladmin@school.com',
      schoolId: 'school_1',
      role: { name: 'SCHOOL_ADMIN', access: [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    TEACHER: {
      _id: 't_1',
      name: 'Teacher One',
      email: 'teacher@school.com',
      schoolId: 'school_1',
      role: { name: 'TEACHER', access: [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    STUDENT: {
      _id: 's_1',
      name: 'Student One',
      email: 'student@school.com',
      schoolId: 'school_1',
      classId: 'class_1',
      sectionId: 'section_1',
      role: { name: 'STUDENT', access: [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    PARENT: {
      _id: 'p_1',
      name: 'Parent One',
      email: 'parent@school.com',
      schoolId: 'school_1',
      childrenIds: ['s_1'],
      role: { name: 'PARENT', access: [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  const user = customUser || defaultUsers[role];
  const token = 'fake-jwt-token-for-testing';

  // Set local storage as our app expects it
  window.localStorage.setItem('auth_token', token);
  window.localStorage.setItem('auth_user', JSON.stringify(user));
});

Cypress.Commands.add('mockApi', (fixtureMap) => {
  Object.entries(fixtureMap).forEach(([endpoint, fixture]) => {
    cy.intercept(
      { url: `**/api${endpoint}*` }, 
      { fixture: fixture }
    ).as(`mock_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`);
  });
});
