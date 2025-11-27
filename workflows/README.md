# Workflows

This directory contains pre-built automation workflows for **n8n** enhanced with **Alchemyst AI** memory capabilities.

## 🛠️ Prerequisites

To use these workflows, you'll need:

1. **n8n** - Workflow automation tool
   - Download n8n.
   - Or use n8n on Cloud.

2. **Alchemyst AI API Key**
   - Sign up at [https://platform.getalchemystai.com](https://platform.getalchemystai.com)
   - Get your API key from the settings page

3. **Additional API Keys** (workflow-specific)
   - Some workflows may require OpenAI, Anthropic, or other service keys
   - Check individual workflow READMEs for specific requirements

## 📥 How to Import a Workflow

1. **Download the workflow file**
   ```bash
   # Navigate to the workflow directory
   cd workflows/[workflow-name]
   
   # The n8n-workflow.json file contains the complete workflow
   ```

2. **Import into n8n**
   - Open your n8n instance
   - Click **"Workflows"** → **"Import from File"**
   - Select the `n8n-workflow.json` file
   - Click **"Import"**

3. **Configure credentials**
   - Add your Alchemyst AI API key
   - Add any other required API keys
   - Test the connections

4. **Activate the workflow**
   - Click **"Active"** to enable the workflow
   - Test with a sample request (check individual README for examples)


## 🤝 Contributing

We welcome contributions of new workflows! To submit a workflow:

1. Create a new directory under `workflows/`
2. Include the `n8n-workflow.json` export
3. Add a comprehensive `README.md` with:
   - Description and use cases
   - Setup instructions
   - Configuration requirements
   - Example requests/responses
   - Testing guide
4. Submit a pull request



### Getting Help

- Check individual workflow READMEs for specific issues
- Review [n8n documentation](https://docs.n8n.io)
- Visit [Alchemyst AI documentation](https://docs.getalchemystai.com)
- Open an issue on GitHub


## 🔗 Related Resources

- [Main Awesome SaaS Documentation](../README.md)
- [Agents Directory](../agents) - Custom AI agents and SDKs
- [Alchemyst AI Platform](https://platform.getalchemystai.com)
- [n8n Documentation](https://docs.n8n.io)
- [Alchemyst n8n Integration Tutorial](https://docs.getalchemystai.com/tutorials/n8n-automation) - Step-by-step guide to build your first workflow
- [Alchemyst n8n Integration Guide](https://docs.getalchemystai.com/integrations/no-code-tools/n8n) - Complete integration reference

---

**Happy Automating! 🎉**

If you create something awesome with these workflows, we'd love to hear about it. Share your success stories and custom workflows with the [community](http://dub.sh/context-community)!
