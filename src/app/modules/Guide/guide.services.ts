
import { PrismaClient } from '@prisma/client';
import { IGuideSearchQuery } from './guide.interface';
import ApiError from '../../../errors/ApiErrors';

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
                    order: true
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
                    order: true
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
                    title: true
                }
            }
        }
    });

    if (!section) throw new ApiError(404, 'Section not found');
    return section;
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
                { practiceNotes: { contains: q, mode: 'insensitive' } }
            ]
        },
        include: {
            chapter: {
                select: {
                    number: true,
                    title: true
                }
            }
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
                { practiceNotes: { contains: q, mode: 'insensitive' } }
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

// ─────────────────────────── ADMIN CRUD ────────────────────────────

const createChapter = async (payload: { number: string; title: string; order: number; isLocked?: boolean }) => {
    const { number, title, order, isLocked = true } = payload;

    if (!number || !title || order === undefined) {
        throw new ApiError(400, 'number, title, and order are required');
    }

    const existing = await prisma.chapter.findUnique({ where: { number } });
    if (existing) {
        throw new ApiError(409, `Chapter with number "${number}" already exists`);
    }

    const chapter = await prisma.chapter.create({
        data: { number, title, order, isLocked }
    });

    return chapter;
};

const updateChapter = async (
    id: string,
    payload: { number?: string; title?: string; order?: number; isLocked?: boolean }
) => {
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

export const GuideServices = {
    getAllChapters,
    getChapterById,
    getSectionById,
    searchGuide,
    createChapter,
    updateChapter,
    deleteChapter
};
