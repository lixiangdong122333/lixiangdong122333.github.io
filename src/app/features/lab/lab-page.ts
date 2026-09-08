import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { SeoService } from '../../core/services/seo';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { CipherTool } from './tools/cipher-tool';
import { ContrastTool } from './tools/contrast-tool';
import { HashTool } from './tools/hash-tool';
import { JsonTool } from './tools/json-tool';
import { ReadingTimeTool } from './tools/reading-time-tool';

@Component({
  selector: 'app-lab-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CipherTool,
    ContrastTool,
    HashTool,
    JsonTool,
    PageIntro,
    ReadingTimeTool,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
  ],
  template: `
    <app-page-intro
      eyebrow="Interactive Lab"
      title="实验室"
      description="用于验证界面、内容与数据处理判断的小型交互实验。"
      icon="flask"
    />

    <section class="bg-white dark:bg-zinc-950">
      <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p-tabs
          value="contrast"
          class="block overflow-hidden rounded-lg border-2 border-slate-200 dark:border-zinc-800"
        >
          <p-tablist>
            <p-tab value="contrast">对比度</p-tab>
            <p-tab value="reading">阅读时间</p-tab>
            <p-tab value="cipher">加解密</p-tab>
            <p-tab value="hash">哈希摘要</p-tab>
            <p-tab value="json">JSON</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="contrast">
              <p
                class="border-b-2 border-slate-200 p-4 text-sm text-slate-500 sm:p-6 dark:border-zinc-800 dark:text-zinc-400"
              >
                检查前景色与背景色的 WCAG 对比度是否达标。
              </p>
              <app-contrast-tool />
            </p-tabpanel>
            <p-tabpanel value="reading">
              <p
                class="border-b-2 border-slate-200 p-4 text-sm text-slate-500 sm:p-6 dark:border-zinc-800 dark:text-zinc-400"
              >
                按中文内容长度估算预计阅读时间。
              </p>
              <app-reading-time-tool />
            </p-tabpanel>
            <p-tabpanel value="cipher">
              <p
                class="border-b-2 border-slate-200 p-4 text-sm text-slate-500 sm:p-6 dark:border-zinc-800 dark:text-zinc-400"
              >
                对称加解密实验：所有计算都在浏览器本地完成，数据不会离开这台设备。
              </p>
              <app-cipher-tool />
            </p-tabpanel>
            <p-tabpanel value="hash">
              <p
                class="border-b-2 border-slate-200 p-4 text-sm text-slate-500 sm:p-6 dark:border-zinc-800 dark:text-zinc-400"
              >
                不可逆摘要实验：所有计算都在浏览器本地完成，数据不会离开这台设备。
              </p>
              <app-hash-tool />
            </p-tabpanel>
            <p-tabpanel value="json">
              <p
                class="border-b-2 border-slate-200 p-4 text-sm text-slate-500 sm:p-6 dark:border-zinc-800 dark:text-zinc-400"
              >
                校验并格式化 JSON 数据。
              </p>
              <app-json-tool />
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>
    </section>
  `,
})
export class LabPage {
  constructor() {
    inject(SeoService).update({
      title: '实验室',
      description: '颜色对比度、阅读时间、加解密、哈希摘要与 JSON 数据处理的交互实验。',
      path: '/lab/',
    });
  }
}
