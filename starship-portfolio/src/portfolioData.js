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

export function sortByStardate(items) {
  return [...items].sort((a, b) => String(a.stardate || '').localeCompare(String(b.stardate || ''), undefined, { numeric: true }));
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
