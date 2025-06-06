import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  OnSelectionChangeData,
  SelectionItemId,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn
} from '@fluentui/react-components';
import CompactFileListStyles from './CompactFileListStyles';
import { File } from '../../../models/File';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { KeyboardEvent, MouseEvent } from 'react';

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' Bytes';
  else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  else if (size < 1024 * 1024 * 1024)
    return (size / 1024 / 1024).toFixed(1) + ' MB';
  else return (size / 1024 / 1024 / 1024).toFixed(1) + ' GB';
};

interface FileListProps {
  files: File[];
  selectedFileIds?: Set<SelectionItemId>;
  onSelectionChange?: (
    e: MouseEvent | KeyboardEvent,
    data: OnSelectionChangeData
  ) => void;
}

export const CompactFileList = ({
  files,
  selectedFileIds,
  onSelectionChange
}: FileListProps) => {
  const styles = CompactFileListStyles();
  const { t } = useTranslation();

  const columns: TableColumnDefinition<File>[] = [
    createTableColumn<File>({
      columnId: 'file',
      compare: (a, b) => {
        return a.filename.localeCompare(b.filename);
      },
      renderHeaderCell: () => {
        return t('file');
      },
      renderCell: (file) => {
        const dotIndex = file.filename.lastIndexOf('.');
        const fileName = file.filename.substring(0, dotIndex);
        const fileExtension = file.filename.substring(dotIndex + 1);

        const file_icon = `https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/${fileExtension}.svg`;

        return (
          <TableCellLayout className={styles.fileCell}>
            <img
              src={file_icon}
              className={styles.fileIcon}
              alt={`${fileExtension} file icon`}
            />
            <span>{fileName}</span>
          </TableCellLayout>
        );
      }
    }),
    createTableColumn<File>({
      columnId: 'size',
      compare: (a, b) => {
        return a.fileSize - b.fileSize;
      },
      renderHeaderCell: () => {
        return t('fileSize');
      },
      renderCell: (file) => {
        return (
          <TableCellLayout>{formatFileSize(file.fileSize)}</TableCellLayout>
        );
      }
    }),
    createTableColumn<File>({
      columnId: 'uploadedAt',
      compare: (a, b) => {
        const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return dateB - dateA;
      },
      renderHeaderCell: () => t('uploadedAt'),
      renderCell: (file) =>
        file.uploadedAt ? (
          <TableCellLayout>
            {format(new Date(file.uploadedAt), 'dd.MM.yyyy HH:mm')}
          </TableCellLayout>
        ) : null
    })
  ];

  const columnSizingOptions = {
    file: {
      defaultWidth: 350,
      minWidth: 60,
      idealWidth: 350
    },
    size: {
      defaultWidth: 55,
      minWidth: 50,
      idealWidth: 55
    },
    uploadedAt: {
      defaultWidth: 105,
      minWidth: 35,
      idealWidth: 105,
    },
  };

  return (
    <div style={{ maxWidth: '50vw', width: 'fit-content' }}>
    <DataGrid
      items={files}
      columns={columns}
      sortable
      subtleSelection
      selectionMode="single"
      resizableColumns
      columnSizingOptions={columnSizingOptions}
      getRowId={(item) => item.id}
      focusMode="composite"
      selectedItems={selectedFileIds}
      onSelectionChange={onSelectionChange}
    >
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<File>>
        {({ item, rowId }) => (
          <DataGridRow<File> key={rowId}>
            {({ renderCell }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
    </div>
  );
};

export default CompactFileList;