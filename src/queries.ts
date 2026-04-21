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
