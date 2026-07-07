export const ROLES = {
  EMPLOYEE: { value: 1, label: 'Software Engineer', baseRole: 'employee' },
  TEAM_LEAD: { value: 2, label: 'Team Lead', baseRole: 'manager' },
  HR: { value: 3, label: 'HR L1', baseRole: 'hr' },
  SENIOR_SOFTWARE_ENGINEER: { value: 4, label: 'Senior Software Engineer', baseRole: 'employee' },
  MANAGER: { value: 5, label: 'Technical Manager L1', baseRole: 'manager' },
  ORGANIZATION_HEAD: { value: 6, label: 'Organization Head', baseRole: 'admin' },
  HR_L2: { value: 7, label: 'HR L2', baseRole: 'hr' },
  MANAGER_L2: { value: 8, label: 'Technical Manager L2', baseRole: 'manager' },
};

export const ROLE_LIST = Object.entries(ROLES).map(([key, val]) => ({
  id: val.value,
  name: key,
  label: val.label,
  baseRole: val.baseRole,
}));

export function getRoleByValue(value) {
  return Object.values(ROLES).find(r => r.value === value) || ROLES.EMPLOYEE;
}

export function getRoleLabel(value) {
  const role = getRoleByValue(value);
  return role ? role.label : 'Unknown';
}

export function isHrRole(value) {
  const role = getRoleByValue(value);
  return role?.baseRole === 'hr';
}

export function isManagerRole(value) {
  const role = getRoleByValue(value);
  return role?.baseRole === 'manager';
}

export function isApproverRole(value) {
  const role = getRoleByValue(value);
  return role?.baseRole === 'manager' || role?.baseRole === 'hr' || role?.value === ROLES.ORGANIZATION_HEAD.value;
}
