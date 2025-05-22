const generatePrompt = (jsonContent: string): string => {

      const prompt = `Generate the content for the Instagram account. Write a post like text and generate an image next.
        Information about the Instagram page: ${jsonContent}
      `;
      
      return prompt;
}

export default generatePrompt;