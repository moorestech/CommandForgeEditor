import { useTranslation } from 'react-i18next';

/**
 * カテゴリー名の翻訳を取得するフック
 * プロジェクトのi18nフォルダから動的に読み込まれた翻訳を使用
 */
export function useCategoryTranslation() {
  const { t } = useTranslation();

  /**
   * カテゴリー名を翻訳
   * @param categoryName - カテゴリー名（例: "Character", "Emotion"）
   * @param fallback - 翻訳が見つからない場合のフォールバック値
   * @returns 翻訳されたカテゴリー名
   */
  const tCategory = (categoryName: string, fallback?: string): string => {
    const translationKey = `category.${categoryName}`;
    const translated = t(translationKey);
    
    // 翻訳キーがそのまま返ってきた場合はフォールバックを使用
    if (translated === translationKey) {
      return fallback || categoryName;
    }
    
    return translated;
  };

  return { tCategory };
}