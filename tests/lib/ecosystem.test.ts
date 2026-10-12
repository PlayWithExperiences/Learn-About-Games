import { describe, expect, it } from 'vitest';
import { parseEcosystem } from '../../src/lib/ecosystem/contract';
import { fixture } from './ecosystem-fixture';
describe('public research ecosystem boundary',()=>{
  it('preserves canonical IDs and honest historical and planned states',()=>{
    const data=parseEcosystem(fixture);expect(data.centres.map(r=>r.identity_status)).toEqual(['verified','planned','historical']);
    expect(data.programs[0].organization_ids).toEqual([data.organizations[0].id]);
  });
  it('rejects extra fields including private data rather than rendering it',()=>{
    for (const key of ['fit_score','notes','excluded','application_strategy','unknown_private']) {
      const data=structuredClone(fixture);Object.assign(data.centres[0],{[key]:'PRIVATE_SENTINEL'});
      expect(()=>parseEcosystem(data)).toThrow();
    }
  });
  it('rejects broken references, empty snapshots, and executable URLs',()=>{
    const wrong=structuredClone(fixture);wrong.centres[0].host_organization_id='unknown';expect(()=>parseEcosystem(wrong)).toThrow();
    expect(()=>parseEcosystem({...fixture,centres:[]})).toThrow();
    const unsafe=structuredClone(fixture);unsafe.centres[0].source_url='javascript:alert(1)';expect(()=>parseEcosystem(unsafe)).toThrow();
  });
});
