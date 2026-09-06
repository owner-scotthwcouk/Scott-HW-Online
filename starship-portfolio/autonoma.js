import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { sign } from './session.js';
import { defineFactory } from '@autonoma-ai/sdk';
import { createExpressHandler } from '@autonoma-ai/server-express';
import {
  createPortfolioData,
  saveAbout,
  saveContact,
  saveEduMaxim,
  saveMissionUpdate,
  saveProject,
} from './src/portfolioData.js';
import { deletePortfolio, updatePortfolio, writePortfolio } from './autonoma-store.js';
import { getAdminCredentials } from './adminCredentials.js';

const portfolioId = z.string().min(1);
const sectionRef = z.object({ id: z.string(), portfolioDataId: z.string() });

function sectionId(portfolioDataId, type, discriminator = '') {
  return `${portfolioDataId}:${type}:${discriminator}`;
}

export const factories = {
  PortfolioData: defineFactory({
    inputSchema: z.object({ name: z.string().min(1) }),
    refSchema: z.object({ id: z.string(), name: z.string() }),
    create: async (data, context) => {
      const id = `portfolio-${context.testRunId}`;
      return writePortfolio(id, createPortfolioData({ id, name: data.name }));
    },
    teardown: async (record) => deletePortfolio(record.id),
  }),
  About: defineFactory({
    inputSchema: z.object({
      portfolioDataId: portfolioId,
      title: z.string(),
      image: z.string(),
      bio: z.string(),
      inspiration: z.string(),
      closing: z.string(),
    }),
    refSchema: sectionRef,
    create: async ({ portfolioDataId, ...about }) => {
      await updatePortfolio(portfolioDataId, (data) => saveAbout(data, about));
      return { id: sectionId(portfolioDataId, 'about'), portfolioDataId };
    },
    teardown: async () => {},
  }),
  Project: defineFactory({
    inputSchema: z.object({
      portfolioDataId: portfolioId,
      stardate: z.string(),
      title: z.string(),
      desc: z.string(),
      url: z.string().url(),
    }),
    refSchema: sectionRef,
    create: async ({ portfolioDataId, ...project }) => {
      project.id = randomUUID();
      await updatePortfolio(portfolioDataId, (data) => saveProject(data, project));
      return { id: project.id, portfolioDataId };
    },
    teardown: async () => {},
  }),
  MissionUpdate: defineFactory({
    inputSchema: z.object({
      portfolioDataId: portfolioId,
      stardate: z.string(),
      update_title: z.string(),
      update_desc: z.string(),
    }),
    refSchema: sectionRef,
    create: async ({ portfolioDataId, ...mission }) => {
      mission.id = randomUUID();
      await updatePortfolio(portfolioDataId, (data) => saveMissionUpdate(data, mission));
      return { id: mission.id, portfolioDataId };
    },
    teardown: async () => {},
  }),
  Contact: defineFactory({
    inputSchema: z.object({
      portfolioDataId: portfolioId,
      email: z.string().email(),
      github: z.string().url(),
      linkedin: z.string().url(),
    }),
    refSchema: sectionRef,
    create: async ({ portfolioDataId, ...contact }) => {
      await updatePortfolio(portfolioDataId, (data) => saveContact(data, contact));
      return { id: sectionId(portfolioDataId, 'contact'), portfolioDataId };
    },
    teardown: async () => {},
  }),
  Edumaxim: defineFactory({
    inputSchema: z.object({
      portfolioDataId: portfolioId,
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      mission: z.string(),
      platform_link: z.string().url(),
      call_to_action: z.string(),
      features: z.array(z.string()).default([
        'Interactive coding challenges and real-time feedback systems',
        'Structured learning pathways aligned with industry standards',
        'Hands-on projects that bridge theoretical knowledge and practical application',
        'Community support and collaborative learning environments',
      ]),
    }),
    refSchema: sectionRef,
    create: async ({ portfolioDataId, ...edumaxim }) => {
      await updatePortfolio(portfolioDataId, (data) => saveEduMaxim(data, edumaxim));
      return { id: sectionId(portfolioDataId, 'edumaxim'), portfolioDataId };
    },
    teardown: async () => {},
  }),
};

export const autonomaHandler = createExpressHandler({
  scopeField: 'portfolioDataId',
  sharedSecret: process.env.AUTONOMA_SHARED_SECRET,
  signingSecret: process.env.AUTONOMA_SIGNING_SECRET,
  factories,
  auth: async (_user, context) => {
    const portfolio = context.refs.PortfolioData?.[0];
    if (!portfolio) return {};
    const credentials = getAdminCredentials();
    if (!credentials) throw new Error('Admin credentials are not configured');
    return {
      cookies: [{
        name: 'autonoma-portfolio',
        value: sign({ scope: String(portfolio.id), exp: Date.now() + 28800000 }),
        secure: Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production'),
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }],
      credentials: {
        username: credentials.username,
        password: credentials.password,
      },
    };
  },
});
