import { CommandDefinition } from '../types';

export interface CategoryNode {
  name: string;
  path: string[];
  children: CategoryNode[];
  commands: CommandDefinition[];
}

/**
 * コマンドをカテゴリー階層でグループ化する
 */
export function groupCommandsByCategory(commands: CommandDefinition[]): CategoryNode {
  const root: CategoryNode = {
    name: 'root',
    path: [],
    children: [],
    commands: []
  };

  // カテゴリーなしのコマンドを直接rootに追加
  const uncategorizedCommands = commands.filter(cmd => !cmd.category || cmd.category.length === 0);
  root.commands = uncategorizedCommands;

  // カテゴリーありのコマンドを処理
  const categorizedCommands = commands.filter(cmd => cmd.category && cmd.category.length > 0);

  for (const command of categorizedCommands) {
    const categories = command.category!;
    let currentNode = root;

    // カテゴリー階層を辿って適切な位置にコマンドを配置
    for (let i = 0; i < categories.length; i++) {
      const categoryName = categories[i];
      const pathUpToHere = categories.slice(0, i + 1);

      // 既存の子ノードを探す
      let childNode = currentNode.children.find(child => child.name === categoryName);

      if (!childNode) {
        // 新しいカテゴリーノードを作成
        childNode = {
          name: categoryName,
          path: pathUpToHere,
          children: [],
          commands: []
        };
        currentNode.children.push(childNode);
      }

      currentNode = childNode;
    }

    // 最終的なカテゴリーノードにコマンドを追加
    currentNode.commands.push(command);
  }

  // 子ノードをアルファベット順でソート
  sortCategoryNode(root);

  return root;
}

/**
 * カテゴリーノードとその子を再帰的にソート
 */
function sortCategoryNode(node: CategoryNode): void {
  // 子ノードを名前順でソート
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  
  // コマンドをラベル順でソート
  node.commands.sort((a, b) => a.label.localeCompare(b.label));

  // 子ノードも再帰的にソート
  for (const child of node.children) {
    sortCategoryNode(child);
  }
}

/**
 * カテゴリーパスを文字列に変換（"Character > Emotion"のような形式）
 */
export function getCategoryPathString(path: string[]): string {
  return path.join(' > ');
}

/**
 * フラットなカテゴリーリストを取得（ドロップダウン用）
 */
export function getFlatCategories(commands: CommandDefinition[]): string[][] {
  const categoriesSet = new Set<string>();
  
  for (const command of commands) {
    if (command.category && command.category.length > 0) {
      categoriesSet.add(JSON.stringify(command.category));
    }
  }

  return Array.from(categoriesSet).map(str => JSON.parse(str)).sort((a, b) => {
    // 階層の深さでソート、同じ深さならアルファベット順
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    return a.join('/').localeCompare(b.join('/'));
  });
}