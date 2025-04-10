import { HttpStatus } from '@nestjs/common';

export const ErrorCodeList: Record<string, (tableName?: string) => string> = {
  '23000': () => 'Integrity constraint violation.',
  '23001': () => 'Restrict violation.',
  '23502': () => 'Not null violation.',
  '23503': (tableName?: string) =>
    `Cannot delete or update "${tableName || 'record'}" due to related references.`,
  '23505': (tableName?: string) =>
    `A "${tableName || 'record'}" with the same name already exists. Please choose a different name.`,
  '23514': () => 'Check violation.',
  '23P01': () => 'Exclusion violation.',
};

export const ErrorCodeToHttpStatus: Record<string, number> = {
  '23505': HttpStatus.CONFLICT, // 중복 키 위반
  '23503': HttpStatus.BAD_REQUEST, // 외래 키 위반
  '23502': HttpStatus.BAD_REQUEST, // NOT NULL 위반
  '23P01': HttpStatus.BAD_REQUEST, // EXCLUSION 위반
};
