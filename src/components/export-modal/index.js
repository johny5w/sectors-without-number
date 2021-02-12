import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import {
  customTagSelector,
  exportTypeSelector,
  isExportOpenSelector,
} from 'store/selectors/base.selectors';
import {
  getExportEntities,
  getCurrentSector,
} from 'store/selectors/entity.selectors';
import {
  setEntityExport,
  closeExport,
  startPrint,
} from 'store/actions/sector.actions';

import ExportModal from './export-modal';

const mapStateToProps = createStructuredSelector({
  exportType: exportTypeSelector,
  isExportOpen: isExportOpenSelector,
  customTags: customTagSelector,
  sector: getCurrentSector,
  entities: getExportEntities,
});

export default injectIntl(
  connect(mapStateToProps, { setEntityExport, closeExport, startPrint })(
    ExportModal,
  ),
);
