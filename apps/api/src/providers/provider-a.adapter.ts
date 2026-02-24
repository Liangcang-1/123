import { Injectable } from '@nestjs/common';

@Injectable()
export class ProviderAAdapter {
  async listTemplates() {
    return [
      {
        providerTemplateId: 'tpl-product-image',
        key: 'product-image-generator',
        name: '商品主图生成',
        description: '生成电商商品主图',
        category: 'ecom_image',
        inputSchema: {
          fields: [
            { name: 'product_name', label: '商品名', type: 'text', required: true },
            { name: 'selling_points', label: '卖点', type: 'textarea', required: true },
            { name: 'style', label: '风格', type: 'select', options: ['简约', '高级', '活力'] },
          ],
        },
        outputSchema: { type: 'image' },
      },
    ];
  }

  async listTools() {
    return [
      {
        providerToolId: 'tool-title-copy',
        key: 'title-copy-tool',
        name: '标题文案优化',
        description: '生成电商平台标题与卖点文案',
        category: 'ecom_copy',
        inputSchema: {
          fields: [
            { name: 'product_name', type: 'text', required: true },
            { name: 'platform', type: 'select', options: ['抖音', '淘宝', '拼多多', '独立站'] },
          ],
        },
        outputSchema: { type: 'text' },
      },
    ];
  }

  async runTask(input: Record<string, unknown>) {
    return {
      providerTaskId: `pt_${Date.now()}`,
      status: 'succeeded',
      resultUrl: 'https://example.com/generated/asset-demo.png',
      output: { summary: '已生成示例结果', input },
      assetType: 'image',
    };
  }
}
