export class LayoutService {
  /**
   * Prepares the layout data for saving or updating.
   * Ensures that large objects are handled correctly if needed.
   */
  static prepareLayoutInput(store: any) {
    const { title, productId, beolOptionId, processPlanId, boundary, chips, laneElements, placements, shotInfo, config, imageUrl } = store;
    
    return {
      title,
      productId,
      beolOptionId,
      processPlanId,
      boundary,
      chips,
      scribelanes: laneElements,
      placements,
      shotInfo,
      config,
      imageUrl
    };
  }

  /**
   * Formats the date for display.
   */
  static formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }
}
