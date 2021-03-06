/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './hiluk-menu.scss';

import * as React from 'react';
import { Dataset } from 'plywood';
import { Fn } from '../../../common/utils/general/general';
import { Stage, Essence, Timekeeper, ExternalView } from '../../../common/models/index';
import { exportOptions, STRINGS } from '../../config/constants';
import { download, FileFormat, makeFileName } from '../../utils/download/download';
import { BubbleMenu } from '../bubble-menu/bubble-menu';
import * as CopyToClipboard from 'react-copy-to-clipboard';

export interface HilukMenuProps extends React.Props<any> {
  essence: Essence;
  timekeeper: Timekeeper;
  openOn: Element;
  onClose: Fn;
  getUrlPrefix: () => string;
  openRawDataModal: Fn;
  openViewDefinitionModal: Fn;
  externalViews?: ExternalView[];
  getDownloadableDataset?: () => Dataset;
  addEssenceToCollection?: () => void;
}

export interface HilukMenuState {
  url?: string;
  fixedTimeUrl?: string;
}

export class HilukMenu extends React.Component<HilukMenuProps, HilukMenuState> {

  constructor(props: HilukMenuProps) {
    super(props);
    this.state = {
      url: null,
      fixedTimeUrl: null
    };
  }

  componentDidMount() {
    const { essence, timekeeper, getUrlPrefix } = this.props;

    const urlPrefix = getUrlPrefix();
    const url = essence.getURL(urlPrefix);
    const fixedTimeUrl = essence.filter.isRelative() ? essence.convertToSpecificFilter(timekeeper).getURL(urlPrefix) : null;

    this.setState({
      url,
      fixedTimeUrl
    });
  }

  openRawDataModal() {
    const { openRawDataModal, onClose } = this.props;
    openRawDataModal();
    onClose();
  }

  openViewDefinitionModal() {
    const { openViewDefinitionModal, onClose } = this.props;
    openViewDefinitionModal();
    onClose();
  }

  onExport(fileFormat: FileFormat) {
    const { onClose, getDownloadableDataset, essence, timekeeper } = this.props;
    const { dataCube, splits } = essence;
    if (!getDownloadableDataset) return;

    const filters = essence.getEffectiveFilter(timekeeper).getFileString(dataCube.timeAttribute);
    const splitsString = splits.toArray().map((split) => {
      const dimension = split.getDimension(dataCube.dimensions);
      if (!dimension) return '';
      return `${STRINGS.splitDelimiter}_${dimension.name}`;
    }).join("_");

    download(getDownloadableDataset(), makeFileName(dataCube.name, filters, splitsString), fileFormat);
    onClose();
  }

  render() {
    const { openOn, onClose, externalViews, essence, getDownloadableDataset, addEssenceToCollection } = this.props;
    const { url, fixedTimeUrl } = this.state;

    const shareOptions: JSX.Element[] = [];

    if (addEssenceToCollection) {
      shareOptions.push(<li
        key="add-to-collection"
        className="add-to-collection"
        onClick={addEssenceToCollection}>{STRINGS.addToCollection}</li>);
    }

    shareOptions.push(<CopyToClipboard text={url}>
      <li
      className="copy-url clipboard"
      key="copy-url"
      onClick={onClose}>{fixedTimeUrl ? STRINGS.copyRelativeTimeUrl : STRINGS.copyUrl}</li>
    </CopyToClipboard>);

    if (fixedTimeUrl) {
      shareOptions.push(<CopyToClipboard text={fixedTimeUrl}>
        <li
        className="copy-specific-url clipboard"
        key="copy-specific-url"
        onClick={onClose}>{STRINGS.copyFixedTimeUrl}</li>
      </CopyToClipboard>);
    }

    if (getDownloadableDataset()) {
      exportOptions.forEach(({ label, fileFormat }) => {
        shareOptions.push(<li
          className="export"
          key="export"
          onClick={this.onExport.bind(this, fileFormat)}>{label}</li>);
      });
    }

    shareOptions.push(<li
      key="view-raw-data"
      onClick={this.openRawDataModal.bind(this)}>{STRINGS.displayRawData}</li>);


    shareOptions.push(<li
      key="display-view-definition"
      onClick={this.openViewDefinitionModal.bind(this)}>{STRINGS.displayViewDefinition}</li>);

    if (externalViews) {
      externalViews.forEach((externalView: ExternalView, i: number) => {
        const url = externalView.linkGeneratorFn(essence.dataCube, essence.timezone, essence.filter, essence.splits);
        if (typeof url !== "string") return;
        const title = `${STRINGS.openIn} ${externalView.title}`;
        const target = externalView.sameWindow ? "_self" : "_blank";
        shareOptions.push(<li key={`custom-url-${i}`}>
          <a href={url} target={target}>{title}</a>
        </li>);
      });
    }

    const stage = Stage.fromSize(200, 200);
    return <BubbleMenu
      className="hiluk-menu"
      direction="down"
      stage={stage}
      openOn={openOn}
      onClose={onClose}
    >
      <ul className="bubble-list">
        {shareOptions}
      </ul>
    </BubbleMenu>;
  }
}
