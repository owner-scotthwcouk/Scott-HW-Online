export function createPortfolioData({ id, name }) {
  return {
    id,
    name,
    about: { title: '', image: '', bio: '', inspiration: '', closing: '' },
    projects: [],
    mission_update: [],
    contact: { email: '', github: '', linkedin: '' },
    edumaxim: {
      title: '', subtitle: '', description: '', mission: '', features: [],
      platform_link: '', call_to_action: '',
    },
  };
}

export function saveAbout(data, about) {
  return { ...data, about: { ...about } };
}

export function saveProject(data, project) {
  project = { ...project, id: project.id || globalThis.crypto.randomUUID() };
  const projects = [...data.projects];
  const existingIndex = projects.findIndex(
    (item) => item.id === project.id,
  );
  if (existingIndex >= 0) projects[existingIndex] = project;
  else projects.push(project);
  return { ...data, projects };
}

export function saveMissionUpdate(data, missionUpdate) {
  missionUpdate = { ...missionUpdate, id: missionUpdate.id || globalThis.crypto.randomUUID() };
  const missionUpdates = [...data.mission_update];
  const existingIndex = missionUpdates.findIndex(
    (item) =>
      item.id === missionUpdate.id,
  );
  if (existingIndex >= 0) missionUpdates[existingIndex] = missionUpdate;
  else missionUpdates.push(missionUpdate);
  return { ...data, mission_update: missionUpdates };
}

export function saveContact(data, contact) {
  return { ...data, contact: { ...contact } };
}

export function saveEduMaxim(data, edumaxim) {
  return { ...data, edumaxim: { ...edumaxim } };
}

export function currentStardate(now = new Date()) {
  const year = now.getFullYear();
  const days = (now - new Date(year, 0, 0)) / 86400000;
  const daysInYear = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  return (1000 * (year - 2000) + 1000 * days / daysInYear).toFixed(2);
}

export function sortByStardate(items, direction = 'desc') {
  return [...items].sort((a, b) => {
    const left = String(a.stardate || '').trim();
    const right = String(b.stardate || '').trim();
    // Keep undated entries last in either direction.
    if (!left || !right) return left ? -1 : right ? 1 : 0;
    const comparison = Number.isFinite(Number(left)) && Number.isFinite(Number(right))
      ? Number(left) - Number(right)
      : left.localeCompare(right, undefined, { numeric: true });
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function normalizePortfolio(data) {
  return { ...data,
    projects: (data.projects || []).map(item => ({ ...item, id: item.id || globalThis.crypto.randomUUID() })),
    mission_update: (data.mission_update || []).map(item => ({ ...item, id: item.id || globalThis.crypto.randomUUID() })),
    edumaxim: {
      title: '', subtitle: '', description: '', mission: '', features: [], platform_link: '', call_to_action: '',
      ...(data.edumaxim || {}),
    },
  };
}
