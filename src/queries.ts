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
      name
      description {
        markdownBody
      }
    }
  }
`;

export const getEpicQuery = `
  query GetEpic($id: ID!) {
    epic(id: $id) {
      name
      description {
        markdownBody
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
    products(page: $page) {
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

export const listFeaturesQuery = `
  query ListFeatures($workspaceId: ID!, $page: Int) {
    product(id: $workspaceId) {
      features(page: $page) {
        nodes {
          referenceNum
          name
        }
        currentPage
        totalCount
        totalPages
        isLastPage
      }
    }
  }
`;

export const listEpicsQuery = `
  query ListEpics($workspaceId: ID!, $page: Int) {
    product(id: $workspaceId) {
      epics(page: $page) {
        nodes {
          referenceNum
          name
        }
        currentPage
        totalCount
        totalPages
        isLastPage
      }
    }
  }
`;

export const listInitiativesQuery = `
  query ListInitiatives($workspaceId: ID!, $page: Int) {
    product(id: $workspaceId) {
      initiatives(page: $page) {
        nodes {
          referenceNum
          name
        }
        currentPage
        totalCount
        totalPages
        isLastPage
      }
    }
  }
`;

export const listGoalsQuery = `
  query ListGoals($workspaceId: ID!, $page: Int) {
    product(id: $workspaceId) {
      goals(page: $page) {
        nodes {
          referenceNum
          name
        }
        currentPage
        totalCount
        totalPages
        isLastPage
      }
    }
  }
`;
