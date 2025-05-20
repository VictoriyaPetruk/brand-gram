const generatePrompt = (jsonContent: string): string => {

      const prompt = `Pretend you are smm. Generate the content for the Instagram account. Write a post and generate an image next.
        Information about the Instagram page: ${jsonContent}
      `;
      
      return prompt;
}

export default generatePrompt;