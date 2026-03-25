
import { PrismaClient } from '@prisma/client';
import { IGuideSearchQuery } from './guide.interface';
import ApiError from '../../../errors/ApiErrors';
import { paginationHelper } from '../../../helpars/paginationHelper';

const prisma = new PrismaClient();

// ─────────────────────────── READ ────────────────────────────

const getAllChapters = async () => {
    const chapters = await prisma.chapter.findMany({
        orderBy: { order: 'asc' },
        include: {
            _count: {
                select: { sections: true }
            },
            sections: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    number: true,
                    title: true,
                    order: true,
                    subChapter: true
                }
            }
        }
    });
    return chapters;
};

const getChapterById = async (id: string) => {
    const chapter = await prisma.chapter.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    number: true,
                    title: true,
                    order: true,
                    subChapter: true
                }
            }
        }
    });

    if (!chapter) throw new ApiError(404, 'Chapter not found');
    return chapter;
};

const getSectionById = async (id: string) => {
    const section = await prisma.section.findUnique({
        where: { id },
        include: {
            chapter: {
                select: {
                    id: true,
                    number: true,
                    title: true,
                    code: true,
                    titleLevel: true,
                    subtitleLevel: true
                }
            },
            internalRefs: true,
            externalRefs: true
        }
    });

    if (!section) throw new ApiError(404, 'Section not found');
    return section;
};

const getAllSections = async (query: { 
    page?: number; 
    limit?: number; 
    searchTerm?: string;
    number?: string;
    title?: string;
    chapterNumber?: string;
    sortBy?: string;
    sortOrder?: string;
}) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(query);
    const { searchTerm, number, title, chapterNumber } = query;

    const where: any = {};

    if (searchTerm) {
        where.OR = [
            { number: { contains: searchTerm, mode: 'insensitive' } },
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { chapter: { number: { contains: searchTerm, mode: 'insensitive' } } }
        ];
    }

    if (number) {
        where.number = { contains: number, mode: 'insensitive' };
    }

    if (title) {
        where.title = { contains: title, mode: 'insensitive' };
    }

    if (chapterNumber) {
        where.chapter = { 
            number: { contains: chapterNumber, mode: 'insensitive' } 
        };
    }

    // Default sorting by Chapter -> Section order if not specified
    const orderBy: any = query.sortBy 
        ? { [sortBy]: sortOrder }
        : [
            {
                chapter: {
                    order: 'asc'
                }
            },
            {
                order: 'asc'
            }
        ];

    const sections = await prisma.section.findMany({
        where,
        include: {
            chapter: {
                select: {
                    number: true,
                    title: true,
                    order: true
                }
            }
        },
        orderBy,
        skip,
        take: limit
    });

    const total = await prisma.section.count({ where });

    return {
        data: sections,
        meta: {
            total,
            page,
            limit
        }
    };
};

const searchGuide = async (query: IGuideSearchQuery) => {
    const { q, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) return { data: [], total: 0 };

    const sections = await prisma.section.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { practiceNotes: { contains: q, mode: 'insensitive' } },
                { subChapter: { contains: q, mode: 'insensitive' } }
            ]
        },
        include: {
            chapter: {
                select: {
                    number: true,
                    title: true,
                    code: true,
                    titleLevel: true,
                    subtitleLevel: true
                }
            },
            internalRefs: true,
            externalRefs: true
        },
        orderBy: { order: 'asc' },
        skip,
        take: Number(limit)
    });

    const total = await prisma.section.count({
        where: {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { practiceNotes: { contains: q, mode: 'insensitive' } },
                { subChapter: { contains: q, mode: 'insensitive' } }
            ]
        }
    });

    return {
        data: sections,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit)
        }
    };
};

// ─────────────────────────── ADMIN CRUD: CHAPTER ────────────────────────────

const createChapter = async (payload: any) => {
    // Basic validation
    if (!payload.number || !payload.title || payload.order === undefined) {
        throw new ApiError(400, 'number, title, and order are required');
    }

    const existing = await prisma.chapter.findUnique({ where: { number: payload.number } });
    if (existing) {
        throw new ApiError(409, `Chapter with number "${payload.number}" already exists`);
    }

    const chapter = await prisma.chapter.create({
        data: payload
    });

    return chapter;
};

const updateChapter = async (id: string, payload: any) => {
    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Chapter not found');

    // If updating number, check uniqueness
    if (payload.number && payload.number !== existing.number) {
        const duplicate = await prisma.chapter.findUnique({ where: { number: payload.number } });
        if (duplicate) throw new ApiError(409, `Chapter with number "${payload.number}" already exists`);
    }

    const updated = await prisma.chapter.update({
        where: { id },
        data: payload
    });

    return updated;
};

const deleteChapter = async (id: string) => {
    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Chapter not found');

    // Cascade delete is handled by Prisma relation (onDelete: Cascade)
    await prisma.chapter.delete({ where: { id } });

    return { message: 'Chapter deleted successfully' };
};

// ─────────────────────────── ADMIN CRUD: SECTION ────────────────────────────

const createSection = async (payload: any) => {
    const { internalRefs, externalRefs, ...sectionData } = payload;

    if (!sectionData.chapterId || !sectionData.number || !sectionData.title || sectionData.order === undefined) {
        throw new ApiError(400, 'chapterId, number, title, and order are required');
    }

    const chapter = await prisma.chapter.findUnique({ where: { id: sectionData.chapterId } });
    if (!chapter) throw new ApiError(404, 'Chapter not found');

    const section = await prisma.section.create({
        data: {
            ...sectionData,
            internalRefs: internalRefs ? { create: internalRefs } : undefined,
            externalRefs: externalRefs ? { create: externalRefs } : undefined
        },
        include: {
            internalRefs: true,
            externalRefs: true
        }
    });

    return section;
};

const updateSection = async (id: string, payload: any) => {
    const { internalRefs, externalRefs, ...sectionData } = payload;

    const existing = await prisma.section.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Section not found');

    const updateData: any = { ...sectionData };

    // Update Internal References (keeping IDs stable if provided)
    if (internalRefs !== undefined) {
        const toUpdate = internalRefs.filter((ref: any) => ref.id);
        const toCreate = internalRefs.filter((ref: any) => !ref.id);
        const toUpdateIds = toUpdate.map((ref: any) => ref.id);

        updateData.internalRefs = {
            deleteMany: {
                id: { notIn: toUpdateIds }
            },
            create: toCreate.map((ref: any) => ({
                linkText: ref.linkText,
                popupTitle: ref.popupTitle,
                popupExcerpt: ref.popupExcerpt
            })),
            update: toUpdate.map((ref: any) => ({
                where: { id: ref.id },
                data: {
                    linkText: ref.linkText,
                    popupTitle: ref.popupTitle,
                    popupExcerpt: ref.popupExcerpt
                }
            }))
        };
    }

    // Update External References (keeping IDs stable if provided)
    if (externalRefs !== undefined) {
        const toUpdate = externalRefs.filter((ref: any) => ref.id);
        const toCreate = externalRefs.filter((ref: any) => !ref.id);
        const toUpdateIds = toUpdate.map((ref: any) => ref.id);

        updateData.externalRefs = {
            deleteMany: {
                id: { notIn: toUpdateIds }
            },
            create: toCreate.map((ref: any) => ({
                linkText: ref.linkText,
                url: ref.url
            })),
            update: toUpdate.map((ref: any) => ({
                where: { id: ref.id },
                data: {
                    linkText: ref.linkText,
                    url: ref.url
                }
            }))
        };
    }

    const updated = await prisma.section.update({
        where: { id },
        data: updateData,
        include: {
            internalRefs: true,
            externalRefs: true
        }
    });

    return updated;
};

const deleteSection = async (id: string) => {
    const existing = await prisma.section.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Section not found');

    // Prisma relation onDelete: Cascade will take care of internalRefs and externalRefs
    await prisma.section.delete({ where: { id } });

    return { message: 'Section deleted successfully' };
};

// ─────────────────────────── ADMIN CRUD: INTERNAL REF ────────────────────────────

const createInternalRef = async (payload: any) => {
    const { sectionId, linkText, popupTitle, popupExcerpt } = payload;
    if (!sectionId || !linkText || !popupTitle || !popupExcerpt) {
        throw new ApiError(400, 'sectionId, linkText, popupTitle, and popupExcerpt are required');
    }

    const result = await prisma.internalRef.create({
        data: payload
    });
    return result;
};

const updateInternalRef = async (id: string, payload: any) => {
    const existing = await prisma.internalRef.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Internal reference not found');

    const result = await prisma.internalRef.update({
        where: { id },
        data: payload
    });
    return result;
};

const deleteInternalRef = async (id: string) => {
    const existing = await prisma.internalRef.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Internal reference not found');

    await prisma.internalRef.delete({ where: { id } });
    return { message: 'Internal reference deleted successfully' };
};

// ─────────────────────────── ADMIN CRUD: EXTERNAL REF ────────────────────────────

const createExternalRef = async (payload: any) => {
    const { sectionId, linkText, url } = payload;
    if (!sectionId || !linkText || !url) {
        throw new ApiError(400, 'sectionId, linkText, and url are required');
    }

    const result = await prisma.externalRef.create({
        data: payload
    });
    return result;
};

const updateExternalRef = async (id: string, payload: any) => {
    const existing = await prisma.externalRef.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'External reference not found');

    const result = await prisma.externalRef.update({
        where: { id },
        data: payload
    });
    return result;
};

const deleteExternalRef = async (id: string) => {
    const existing = await prisma.externalRef.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'External reference not found');

    await prisma.externalRef.delete({ where: { id } });
    return { message: 'External reference deleted successfully' };
};

export const GuideServices = {
    getAllChapters,
    getChapterById,
    getSectionById,
    getAllSections,
    searchGuide,
    createChapter,
    updateChapter,
    deleteChapter,
    createSection,
    updateSection,
    deleteSection,
    createInternalRef,
    updateInternalRef,
    deleteInternalRef,
    createExternalRef,
    updateExternalRef,
    deleteExternalRef
};
