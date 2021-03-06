/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiLink, EuiIcon } from '@elastic/eui';

import { Index, Operation, Shard } from '../../../types';
import { msToPretty } from '../../../utils';
import { ShardDetailTree } from './shard_details_tree';
import { PercentageBadge } from '../../percentage_badge';

interface Props {
  index: Index;
  shard: Shard;
  operations: Operation[];
}

export const ShardDetails = ({ index, shard, operations }: Props) => {
  const { relative, time } = shard;

  const [shardVisibility, setShardVisibility] = useState<boolean>(false);

  return (
    <>
      <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none" direction="row">
        <EuiFlexItem grow={false} className="prfDevTool__profileTree__shard__header-flex-item">
          <EuiLink
            className="prfDevTool__profileTree__shardDetails"
            onClick={() => setShardVisibility(!shardVisibility)}
          >
            <EuiIcon type={shardVisibility ? 'arrowDown' : 'arrowRight'} />[{shard.id[0]}][
            {shard.id[2]}]
          </EuiLink>
        </EuiFlexItem>
        <EuiFlexItem grow={false} className="prfDevTool__profileTree__shard__header-flex-item">
          <EuiText className="prfDevTool__shardDetails--dim">
            <PercentageBadge
              timePercentage={relative as number}
              label={msToPretty(time as number, 3)}
              valueType={'time'}
            />
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      {shardVisibility
        ? operations.map((data, idx) => (
            <ShardDetailTree key={idx} index={index} shard={shard} data={data} />
          ))
        : null}
    </>
  );
};
