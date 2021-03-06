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

import { expect } from 'chai';
import { testImmutableClass } from 'immutable-class-tester';

import { Dimension, DimensionJS } from './dimension';

describe('Dimension', () => {
  it('is an immutable class', () => {
    testImmutableClass<DimensionJS>(Dimension, [
      {
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        granularities: [
          { op: 'numberBucket', size: 5 },
          { op: 'numberBucket', size: 50 },
          { op: 'numberBucket', size: 500 },
          { op: 'numberBucket', size: 800 },
          { op: 'numberBucket', size: 1000 }
        ],
        sortStrategy: 'self'
      },
      {
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        url: 'https://www.country.com/%s',
        bucketedBy: {
          op: 'numberBucket',
          size: 1
        },
        bucketingStrategy: 'defaultBucket'
      },
      {
        name: 'time',
        title: 'time',
        formula: '$time',
        kind: 'time',
        url: 'http://www.time.com/%s',
        granularities: [
          { op: 'timeBucket', duration: 'PT1M' },
          { op: 'timeBucket', duration: 'P6M', timezone: 'Etc/UTC' },
          { op: 'timeBucket', duration: 'PT6H' },
          { op: 'timeBucket', duration: 'P1D' },
          { op: 'timeBucket', duration: 'P1W' }
        ]
      },
      {
        name: 'time',
        title: 'time',
        formula: '$time',
        kind: 'time',
        url: 'http://www.time.com/%s',
        granularities: [
          { op: 'timeBucket', duration: 'PT1M' },
          { op: 'timeBucket', duration: 'P6M' },
          { op: 'timeBucket', duration: 'PT6H' },
          { op: 'timeBucket', duration: 'P1D' },
          { op: 'timeBucket', duration: 'P1W' }
        ],
        bucketedBy: {
          op: 'timeBucket',
          duration: 'PT6H'
        }
      }
    ]);
  });

  describe('back compat', () => {
    it('upgrades expression to formula', () => {
      expect(Dimension.fromJS({
        name: 'country',
        title: 'important countries',
        expression: '$country',
        kind: 'string'
      } as any).toJS()).to.deep.equal({
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string'
      });
    });
/* TODO: check the correctness of the test */
/*    it('neverBucket -> default no bucket', () => {
      expect(Dimension.fromJS({
        name: 'country',
        title: 'important countries',
        expression: '$country',
        kind: 'string',
        bucketingStrategy: 'neverBucket'
      } as any).toJS()).to.deep.equal({
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        bucketingStrategy: 'defaultNoBucket'
      });
    });*/
/* TODO: check the correctness of the test */
/*    it('alwaysBucket -> default bucket', () => {
      expect(Dimension.fromJS({
        name: 'country',
        title: 'important countries',
        expression: '$country',
        kind: 'string',
        bucketingStrategy: 'alwaysBucket'
      } as any).toJS()).to.deep.equal({
        name: 'country',
        title: 'important countries',
        formula: '$country',
        kind: 'string',
        bucketingStrategy: 'defaultBucket'
      });
    });*/

  });

  describe('errors', () => {
    it('throws on invalid type', () => {
      var dimJS = {
          name: 'mixed_granularities',
          title: 'Mixed Granularities',
          kind: 'string',
          granularities: [5, 50, 'P1W', 800, 1000]
        };

      expect(() => { Dimension.fromJS(dimJS); }).to.throw("granularities must have the same type of actions");

      var dimJS2 = {
        name: 'bad type',
        title: 'Bad Type',
        kind: 'string',
        granularities: [false, true, true, false, false]
      };


      expect(() => { Dimension.fromJS(dimJS2 as DimensionJS); }).to.throw("input should be of type number, string, or action");

    });

  });

});
