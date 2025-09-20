import { COLLABORATOR_ROLES } from 'src/constants';

export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

export type Collaborator = { id: string; role: CollaboratorRole };
