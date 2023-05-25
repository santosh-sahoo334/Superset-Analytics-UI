/* eslint-disable react/jsx-sort-default-props */
/* eslint-disable react/sort-prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, styled } from '@superset-ui/core';

const StyledLegend = styled.div`
  ${({ theme }) => `
    font-size: ${theme.typography.sizes.s}px;
    position: absolute;
    background: ${theme.colors.grayscale.light5};
    border: 1px solid ${theme.colors.grayscale.thinblackborder};
    margin: 2px;
    padding: 4px 6px;
    outline: none;
    top: 0;
    right:0;
    overflow-y: auto;
    max-height: auto;

    & ul {
      list-style: none;
      padding-left: 0;
      margin: 0;
      font-size:14px;

      & li a {
        color: ${theme.colors.grayscale.base};
        text-decoration: none;

        & span {
          margin-right: 6px;
          margin-left: 10px;

        }
      }
    }
    & span {
      fontWeight: 'bold';
      font-size:16px;
    }

    .grid-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      list-style: none;
      padding-left: 0;
      margin: 0;
      font-size:14px;
    }

  `}
`;

const categoryDelimiter = ' - ';

const propTypes = {
  categories: PropTypes.object,
  forceCategorical: PropTypes.bool,
  format: PropTypes.string,
  position: PropTypes.oneOf([null, 'tl', 'tr', 'bl', 'br']),
  showSingleCategory: PropTypes.func,
  toggleCategory: PropTypes.func,
  legendheading: PropTypes.string,
};

const defaultProps = {
  categories: {},
  forceCategorical: false,
  format: null,
  position: 'tr',
  showSingleCategory: () => {},
  toggleCategory: () => {},
  legendheading: null,
};

export default class Legend extends React.PureComponent {
  format(value) {
    if (!this.props.format || this.props.forceCategorical) {
      return value;
    }

    const numValue = parseFloat(value);

    return formatNumber(this.props.format, numValue);
  }

  formatCategoryLabel(k) {
    if (!this.props.format) {
      return k;
    }

    if (k.includes(categoryDelimiter)) {
      const values = k.split(categoryDelimiter);

      return (
        this.format(values[0]) + categoryDelimiter + this.format(values[1])
      );
    }

    return this.format(k);
  }

  render() {
    if (
      Object.keys(this.props.categories).length === 0 ||
      this.props.position === null
    ) {
      return null;
    }

    const categories = Object.entries(this.props.categories)
      .sort((a, b) => {
        if (
          b[0].includes('(') &&
          a[0].includes('(') &&
          a[0].includes(',') &&
          b[0].includes(',')
        ) {
          return (
            Number(b[0].split('(')[1].split(',')[1].replace(')', '')) -
            Number(a[0].split('(')[1].split(',')[1].replace(')', ''))
          );
        }
        return 0;
      })
      .map(([k, v]) => {
        const style = { color: `rgba(${v.color.join(', ')})` };
        const icon = v.enabled ? '\u25FC' : '\u25FB';
        const metric = v.metricsvalue
          ? `${v.metricsvalue.toFixed(2)}%`
          : `0.00%`;
        const totalcount = v.totalcount ? `(${v.totalcount})` : `(0)`;
        return (
          <li key={k}>
            <a
              href="#"
              onClick={() => this.props.toggleCategory(k)}
              onDoubleClick={() => this.props.showSingleCategory(k)}
            >
              <span style={style}>{icon}</span> {this.formatCategoryLabel(k)}{' '}
              {metric} {totalcount}
            </a>
          </li>
        );
      });

    const vertical = this.props.position.charAt(0) === 't' ? 'top' : 'bottom';
    const horizontal = this.props.position.charAt(1) === 'r' ? 'right' : 'left';
    const style = {
      fontWeight: 'bold',
      position: 'absolute',
      [vertical]: '0px',
      [horizontal]: '0px',
    };

    const shouldApplyGrid = categories.length > 10;
    const ulClassName = shouldApplyGrid ? 'grid-list' : '';
    return (
      <StyledLegend style={style}>
        <span>{this.props.legendheading}</span>
        <ul className={ulClassName}>{categories}</ul>
      </StyledLegend>
    );
  }
}

Legend.propTypes = propTypes;
Legend.defaultProps = defaultProps;