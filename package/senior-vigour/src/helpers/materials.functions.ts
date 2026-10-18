import type { IMaterial } from '../types/material';
import { constantsUrls } from './constants';

export const getMaterialUrl = (material: IMaterial, lang: string = 'en'): string => {
    const targetLang = material.languages?.[lang]?.name ? lang : 'en';
    const targetLangFile = material.languages?.[targetLang];
    const ext = targetLangFile?.fileExtension ? `.${targetLangFile.fileExtension}` : '';
    const fileName = ext && targetLangFile?.name && !targetLangFile.name.endsWith(ext)
        ? `${targetLangFile.name}${ext}`
        : (targetLangFile?.name ?? '');

    return `${constantsUrls.Materials.cdnMaterials}/${material.name}/${targetLang}/${fileName}`;
};

export const getMaterialPageUrl = (material: IMaterial, lang: string = 'en', page: number = 1): string => {
    const targetLang = material.languages?.[lang]?.name ? lang : 'en';
    const targetLangFile = material.languages?.[targetLang];
    const pageNumber = Math.max(1, page || 1);
    const ext = targetLangFile?.fileExtension ? `.${targetLangFile.fileExtension}` : '.pdf';
    const baseName = targetLangFile?.name ? targetLangFile.name.replace(/\.[^/.]+$/, '') : material.name;

    return `${constantsUrls.Materials.cdnMaterials}/${material.name}/${targetLang}/pages/${baseName}-${pageNumber}${ext}`;
};

export const downloadFile = (fileUrl: string): void => {
    const filePathArr = fileUrl.split('/');
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', filePathArr[filePathArr.length - 1]);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
