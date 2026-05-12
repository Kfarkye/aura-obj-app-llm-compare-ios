import { initializeApp } from 'firebase-admin/app';
import { llmProxy } from './llmProxy';
import { aggregateRankings } from './aggregateRankings';
import { deleteAccount } from './deleteAccount';
import { moderateContent } from './moderateContent';

initializeApp();

export {
    llmProxy,
    aggregateRankings,
    deleteAccount,
    moderateContent
};
