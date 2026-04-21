export const getPageQuery = `
  query GetPage($id: ID!, $includeParent: Boolean!) {
    page(id: $id) {
      name
      description {
        markdownBody
      }
      children {
        name
        referenceNum
      }
      parent @include(if: $includeParent) {
        name
        referenceNum
      }
    }
  }
`;

export const getFeatureQuery = `
  query GetFeature($id: ID!) {
    feature(id: $id) {
      referenceNum
      name
      description {
        markdownBody
      }
      workflowStatus {
        name
        internalMeaning
      }
      tagList
      tags {
        name
      }
      dueDate
      startDate
      assignedToUser {
        name
        email
      }
      epic {
        referenceNum
        name
      }
      integrationLinks {
        name
        url
        integration {
          serviceName
        }
      }
      requirements {
        referenceNum
        name
        workflowStatus {
          name
          internalMeaning
        }
        description {
          markdownBody
        }
      }
    }
  }
`;

export const getEpicQuery = `
  query GetEpic($id: ID!) {
    epic(id: $id) {
      referenceNum
      name
      description {
        markdownBody
      }
      workflowStatus {
        name
        internalMeaning
      }
      tagList
      tags {
        name
      }
      dueDate
      startDate
      assignedToUser {
        name
        email
      }
      initiative {
        referenceNum
        name
      }
      featuresCount
      features {
        referenceNum
        name
        workflowStatus {
          name
          internalMeaning
        }
        dueDate
        startDate
        assignedToUser {
          name
          email
        }
        tagList
        description {
          markdownBody
        }
        integrationLinks {
          name
          url
          integration {
            serviceName
          }
        }
      }
      integrationLinks {
        name
        url
        integration {
          serviceName
        }
      }
    }
  }
`;

export const getInitiativeQuery = `
  query GetInitiative($id: ID!) {
    initiative(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const getGoalQuery = `
  query GetGoal($id: ID!) {
    goal(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const getRequirementQuery = `
  query GetRequirement($id: ID!) {
    requirement(id: $id) {
      name
      description {
        markdownBody
      }
    }
  }
`;

export const searchDocumentsQuery = `
  query SearchDocuments(
    $query: String!
    $searchableType: [String!]!
    $page: Int
  ) {
    searchDocuments(
      filters: { query: $query, searchableType: $searchableType }
      page: $page
    ) {
      nodes {
        name
        url
        searchableId
        searchableType
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;

export const listWorkspacesQuery = `
  query ListWorkspaces($page: Int) {
    projects(page: $page) {
      nodes {
        id
        referencePrefix
        name
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;

export const listInitiativesQuery = `
  query ListInitiatives($workspaceId: ID!) {
    project(id: $workspaceId) {
      initiatives {
        referenceNum
        name
      }
    }
  }
`;

export const listGoalsQuery = `
  query ListGoals($workspaceId: ID!) {
    project(id: $workspaceId) {
      goals {
        referenceNum
        name
      }
    }
  }
`;

export const listFeaturesForEpicQuery = `
  query ListFeaturesForEpic($epicId: ID!) {
    epic(id: $epicId) {
      referenceNum
      name
      featuresCount
      features {
        referenceNum
        name
        workflowStatus {
          name
          internalMeaning
        }
        dueDate
        startDate
        assignedToUser {
          name
          email
        }
        tagList
        description {
          markdownBody
        }
        integrationLinks {
          name
          url
          integration {
            serviceName
          }
        }
      }
    }
  }
`;

export const listWorkflowStatusesQuery = `
  query ListWorkflowStatuses($workspaceId: ID!) {
    features(filters: { projectId: $workspaceId }, page: 1) {
      nodes {
        workflowKind {
          name
          workflow {
            name
            workflowStatuses {
              name
              internalMeaning
              position
            }
          }
        }
      }
      totalCount
    }
  }
`;

export const getInitiativeDetailQuery = `
  query GetInitiativeDetail($id: ID!) {
    initiative(id: $id) {
      referenceNum
      name
      description {
        markdownBody
      }
      workflowStatus {
        name
        internalMeaning
      }
      epicsCount
      epics {
        referenceNum
        name
        workflowStatus {
          name
          internalMeaning
        }
      }
    }
  }
`;

// ── Releases ─────────────────────────────────────────────────────────────────

export const listReleasesQuery = `
  query ListReleases($workspaceId: ID!, $page: Int) {
    releases(filters: { projectId: $workspaceId }, page: $page) {
      nodes {
        id
        referenceNum
        name
      }
      currentPage
      totalCount
      totalPages
      isLastPage
    }
  }
`;

// ── Shared error fragment (inline) ────────────────────────────────────────────
const errorsFragment = `errors { attributes { name messages } }`;

// ── Feature mutations ─────────────────────────────────────────────────────────

export const createFeatureMutation = `
  mutation CreateFeature(
    $name: String!
    $releaseId: ID!
    $projectId: ID
    $epicId: ID
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
    $tagList: String
    $dueDate: String
  ) {
    createFeature(
      attributes: {
        name: $name
        release: { id: $releaseId }
        project: { id: $projectId }
        epic: { id: $epicId }
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
        tagList: $tagList
        dueDate: $dueDate
      }
      skipRequiredFieldsValidation: true
    ) {
      ${errorsFragment}
      feature {
        referenceNum
        name
        workflowStatus { name internalMeaning }
        epic { referenceNum name }
        assignedToUser { name email }
        dueDate
        tagList
      }
    }
  }
`;

export const updateFeatureMutation = `
  mutation UpdateFeature(
    $id: ID!
    $name: String
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
    $tagList: String
    $dueDate: String
    $epicId: ID
  ) {
    updateFeature(
      id: $id
      attributes: {
        name: $name
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
        tagList: $tagList
        dueDate: $dueDate
        epic: { id: $epicId }
      }
    ) {
      ${errorsFragment}
      feature {
        referenceNum
        name
        workflowStatus { name internalMeaning }
        epic { referenceNum name }
        assignedToUser { name email }
        dueDate
        tagList
      }
    }
  }
`;

export const deleteFeatureMutation = `
  mutation DeleteFeature($id: ID!) {
    deleteFeature(id: $id) {
      ${errorsFragment}
      feature { referenceNum }
    }
  }
`;

// ── Epic mutations ────────────────────────────────────────────────────────────

export const createEpicMutation = `
  mutation CreateEpic(
    $name: String!
    $releaseId: ID!
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
    $initiativeId: ID
  ) {
    createEpic(
      attributes: {
        name: $name
        release: { id: $releaseId }
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
        initiative: { id: $initiativeId }
      }
      skipRequiredFieldsValidation: true
    ) {
      ${errorsFragment}
      epic {
        referenceNum
        name
        workflowStatus { name internalMeaning }
        initiative { referenceNum name }
        assignedToUser { name email }
        dueDate
      }
    }
  }
`;

export const updateEpicMutation = `
  mutation UpdateEpic(
    $id: ID!
    $name: String
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
    $initiativeId: ID
  ) {
    updateEpic(
      id: $id
      attributes: {
        name: $name
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
        initiative: { id: $initiativeId }
      }
    ) {
      ${errorsFragment}
      epic {
        referenceNum
        name
        workflowStatus { name internalMeaning }
        initiative { referenceNum name }
        assignedToUser { name email }
        dueDate
      }
    }
  }
`;

export const deleteEpicMutation = `
  mutation DeleteEpic($id: ID!) {
    deleteEpic(id: $id) {
      ${errorsFragment}
      epic { referenceNum }
    }
  }
`;

// ── Requirement mutations ─────────────────────────────────────────────────────

export const createRequirementMutation = `
  mutation CreateRequirement(
    $name: String!
    $featureId: ID!
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
  ) {
    createRequirement(
      attributes: {
        name: $name
        feature: { id: $featureId }
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
      }
      skipRequiredFieldsValidation: true
    ) {
      ${errorsFragment}
      requirement {
        referenceNum
        name
        workflowStatus { name internalMeaning }
      }
    }
  }
`;

export const updateRequirementMutation = `
  mutation UpdateRequirement(
    $id: ID!
    $name: String
    $description: String
    $workflowStatusName: String
    $assignedToUserEmail: String
  ) {
    updateRequirement(
      id: $id
      attributes: {
        name: $name
        description: $description
        workflowStatus: { name: $workflowStatusName }
        assignedToUser: { email: $assignedToUserEmail }
      }
    ) {
      ${errorsFragment}
      requirement {
        referenceNum
        name
        workflowStatus { name internalMeaning }
      }
    }
  }
`;

export const deleteRequirementMutation = `
  mutation DeleteRequirement($id: ID!) {
    deleteRequirement(id: $id) {
      ${errorsFragment}
      requirement { referenceNum }
    }
  }
`;
