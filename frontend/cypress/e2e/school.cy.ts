describe('School Management CRUD Operations (Super Admin & School Admin)', () => {
  const suffix = Date.now().toString().slice(-4);
  const testSchoolName = `E2E School ${suffix}`;
  const adminEmail = `admin${suffix}@testschool.com`;
  const adminPassword = 'Password123!';
  const teacherName = `Teacher ${suffix}`;
  const teacherEmail = `teacher${suffix}@testschool.com`;
  const teacherCode = `TCH${suffix}`;
  const classNameSuper = `SuperClass ${suffix}`;
  const classNameAdmin = `AdminClass ${suffix}`;
  const subjectNameSuper = `SuperSubject ${suffix}`;
  const subjectNameAdmin = `AdminSubject ${suffix}`;

  it('1. Super Admin: Create School, Class, Teacher, Subject', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('testsuperadmin@gmail.com');
    cy.get('input[name="password"], input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains(/Welcome to Dashboard/i, { timeout: 15000 }).should('exist');

    // CREATE SCHOOL
    cy.contains('School Management').click();
    cy.contains('Manage Schools').click();
    cy.contains(/add school|create school|new school/i).click();
    
    // Step 1: Subscription Plan
    cy.get('body').then($body => {
      if ($body.find('input[name="subscriptionPlan"]').length > 0) {
        cy.get('div[id*="subscriptionPlan"]').click();
        cy.get('li[data-value]').first().click();
        cy.get('input[name="maxStudents"]').type('500');
        cy.contains(/next|continue/i).click();
      }
    });

    // Step 2: School Details
    cy.get('input[name="name"]').type(testSchoolName);
    cy.get('input[name="code"]').type(`TS${suffix}`);
    cy.get('input[name="subdomain"]').type(`ts${suffix}`);
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="phone"]').type('9999999999');
    
    cy.get('body').then($body => {
        if ($body.find('div[id*="country"]').length > 0) {
            cy.get('div[id*="country"]').click();
            cy.get('li[data-value]').first().click();
        }
    });
    cy.contains(/next|continue/i).click();

    // Step 3: Admin Details
    cy.get('input[name="adminName"]').type(`Admin ${suffix}`);
    cy.get('input[name="adminEmail"]').type(adminEmail);
    cy.get('input[name="adminPassword"]').type(adminPassword);
    cy.contains(/submit|create|save/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // READ & UPDATE SCHOOL
    cy.contains('tr', testSchoolName).should('exist');
    cy.contains('tr', testSchoolName).find('button[aria-label="Actions"]').click();
    cy.contains('Edit').click();
    cy.get('input[name="phone"]').clear().type('8888888888');
    cy.contains(/save|update/i).click();
    cy.contains(/success|updated/i, { timeout: 10000 }).should('exist');

    // CREATE CLASS
    cy.contains('Classes').click();
    cy.contains(/add class|create class/i).click();
    cy.get('div[id*="schoolId"]').click();
    cy.contains('li', testSchoolName).click();
    cy.get('input[name="name"]').type(classNameSuper);
    cy.get('input[name="sections"]').type('A{enter}');
    cy.contains(/submit|create|save/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // READ & UPDATE CLASS
    cy.contains('tr', classNameSuper).should('exist');
    cy.contains('tr', classNameSuper).find('button[aria-label="Actions"]').click();
    cy.contains('Edit').click();
    cy.get('input[name="sections"]').type('B{enter}');
    cy.contains(/save|update/i).click();
    cy.contains(/success|updated/i, { timeout: 10000 }).should('exist');

    // CREATE TEACHER
    cy.contains('User Management').click();
    cy.contains('Teachers').click();
    cy.contains(/add teacher|create teacher/i).click();
    cy.get('div[id*="schoolId"]').click();
    cy.contains('li', testSchoolName).click();
    cy.get('input[name="name"]').type(teacherName);
    cy.get('input[name="email"]').type(teacherEmail);
    cy.get('input[name="password"]').type('123456');
    cy.get('input[name="userCode"]').type(teacherCode);
    cy.contains(/submit|create|save|add/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // CREATE SUBJECT
    cy.contains('School Management').click();
    cy.contains('Subjects').click();
    cy.contains(/add subject|create subject/i).click();
    cy.get('div[id*="schoolId"]').click();
    cy.contains('li', testSchoolName).click();
    cy.get('input[name="name"]').type(subjectNameSuper);
    cy.get('input[name="code"]').type(`SUB${suffix}`);
    cy.contains(/submit|create|save/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // READ & UPDATE SUBJECT
    cy.contains('tr', subjectNameSuper).should('exist');
    cy.contains('tr', subjectNameSuper).find('button[aria-label="Actions"]').click();
    cy.contains('Edit').click();
    cy.get('input[name="code"]').clear().type(`UP${suffix}`);
    cy.contains(/save|update/i).click();
    cy.contains(/success|updated/i, { timeout: 10000 }).should('exist');

    // LOGOUT
    cy.get('button[aria-label="account of current user"], .MuiAvatar-root').first().click();
    cy.contains(/logout|sign out/i).click();
  });

  it('2. School Admin: Create Class and Subject', () => {
    cy.visit('/login');
    // Using the admin credentials created in the Super Admin flow
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"], input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.contains(/Welcome to Dashboard/i, { timeout: 15000 }).should('exist');

    // CREATE CLASS
    cy.contains('School Management').click();
    cy.contains('Classes').click();
    cy.contains(/add class|create class/i).click();
    // No school selection needed for School Admin
    cy.get('input[name="name"]').type(classNameAdmin);
    cy.get('input[name="sections"]').type('C{enter}');
    cy.contains(/submit|create|save/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // CREATE SUBJECT
    cy.contains('Subjects').click();
    cy.contains(/add subject|create subject/i).click();
    // No school selection needed for School Admin
    cy.get('input[name="name"]').type(subjectNameAdmin);
    cy.get('input[name="code"]').type(`ADM${suffix}`);
    cy.contains(/submit|create|save/i).click();
    cy.contains(/success|created/i, { timeout: 10000 }).should('exist');

    // LOGOUT
    cy.get('button[aria-label="account of current user"], .MuiAvatar-root').first().click();
    cy.contains(/logout|sign out/i).click();
  });

  it('3. Super Admin: Cleanup (Delete Subject, Class, Teacher, Deactivate & Delete School)', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('testsuperadmin@gmail.com');
    cy.get('input[name="password"], input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.contains(/Welcome to Dashboard/i, { timeout: 15000 }).should('exist');

    // DELETE SUBJECTS
    cy.contains('School Management').click();
    cy.contains('Subjects').click();
    
    // Delete Super Admin Subject
    cy.get('input[placeholder*="Search"]').clear().type(subjectNameSuper);
    cy.contains('tr', subjectNameSuper).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');
    
    // Delete School Admin Subject
    cy.get('input[placeholder*="Search"]').clear().type(subjectNameAdmin);
    cy.contains('tr', subjectNameAdmin).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');

    // DELETE CLASSES
    cy.contains('Classes').click();
    
    // Delete Super Admin Class
    cy.get('input[placeholder*="Search"]').clear().type(classNameSuper);
    cy.contains('tr', classNameSuper).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');

    // Delete School Admin Class
    cy.get('input[placeholder*="Search"]').clear().type(classNameAdmin);
    cy.contains('tr', classNameAdmin).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');

    // DELETE TEACHER
    cy.contains('User Management').click();
    cy.contains('Teachers').click();
    cy.get('input[placeholder*="Search"]').clear().type(teacherEmail);
    cy.contains('tr', teacherEmail).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');

    // DEACTIVATE AND DELETE SCHOOL
    cy.contains('School Management').click();
    cy.contains('Manage Schools').click();
    
    // Deactivate
    cy.get('input[placeholder*="Search"]').clear().type(testSchoolName);
    cy.contains('tr', testSchoolName).find('button[aria-label="Actions"]').click();
    cy.contains('Deactivate').click();
    cy.contains('button', 'Deactivate').click();
    cy.contains(/success|deactivated/i, { timeout: 10000 }).should('exist');

    // Delete
    // Need to clear and search again because the table might refresh
    cy.get('input[placeholder*="Search"]').clear().type(testSchoolName);
    cy.contains('tr', testSchoolName).find('button[aria-label="Actions"]').click();
    cy.contains('Delete').click();
    cy.get('input[type="password"]').type('123456');
    cy.contains('button', 'Delete').click();
    cy.contains(/success|deleted/i, { timeout: 10000 }).should('exist');
  });
});
