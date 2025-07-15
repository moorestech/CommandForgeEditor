import { memo } from 'react';
import { CommandDefinition } from '../../types';
import { CategoryNode } from '../../utils/commandCategories';
import { useCategoryTranslation } from '../../hooks/useCategoryTranslation';

interface CategoryMenuRendererProps {
  categoryNode: CategoryNode;
  onSelectCommand: (commandType: string) => void;
  // UI components to use for rendering
  components: {
    MenuItem: React.ComponentType<any>;
    MenuSub: React.ComponentType<any>;
    MenuSubTrigger: React.ComponentType<any>;
    MenuSubContent: React.ComponentType<any>;
    MenuSeparator: React.ComponentType<any>;
  };
  // Optional custom renderer for command items
  renderCommand?: (command: CommandDefinition, onClick: () => void) => React.ReactNode;
}

/**
 * Generic category menu renderer that can be used with different menu UI components
 * (DropdownMenu, ContextMenu, etc.)
 */
export const CategoryMenuRenderer = memo(({ 
  categoryNode, 
  onSelectCommand,
  components,
  renderCommand
}: CategoryMenuRendererProps) => {
  const { tCategory } = useCategoryTranslation();
  const { MenuItem, MenuSub, MenuSubTrigger, MenuSubContent, MenuSeparator } = components;
  
  return (
    <>
      {/* Render commands at this level */}
      {categoryNode.commands.map((command) => (
        <MenuItem 
          key={command.id}
          onClick={() => onSelectCommand(command.id)}
        >
          {renderCommand ? renderCommand(command, () => onSelectCommand(command.id)) : command.label}
        </MenuItem>
      ))}
      
      {/* Add separator if there are both commands and subcategories */}
      {categoryNode.commands.length > 0 && categoryNode.children.length > 0 && (
        <MenuSeparator />
      )}
      
      {/* Render subcategories */}
      {categoryNode.children.map((childCategory) => (
        <MenuSub key={childCategory.name}>
          <MenuSubTrigger>
            {tCategory(childCategory.name)}
          </MenuSubTrigger>
          <MenuSubContent>
            <CategoryMenuRenderer 
              categoryNode={childCategory} 
              onSelectCommand={onSelectCommand}
              components={components}
              renderCommand={renderCommand}
            />
          </MenuSubContent>
        </MenuSub>
      ))}
    </>
  );
});

CategoryMenuRenderer.displayName = 'CategoryMenuRenderer';