import { lazy, type ComponentType } from "react";

/**
 * A wrapper for React.lazy that reloads the page once if the import fails.
 * This is useful for handling "Failed to fetch dynamically imported module" errors
 * that occur when a new version is deployed and the user's browser attempts
 * to fetch old chunks.
 */
export const lazyRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  name = "component"
) => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem(`retry-${name}-refreshed`) || "false"
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem(`retry-${name}-refreshed`, "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version of the application.
        // Let's refresh the page immediately.
        console.log(`Dynamic import failed for ${name}, reloading page...`, error);
        window.sessionStorage.setItem(`retry-${name}-refreshed`, "true");
        window.location.reload();
      }
      
      // The page has already been reloaded and we still have an error.
      // Throw it so an Error Boundary can catch it.
      throw error;
    }
  });
};
