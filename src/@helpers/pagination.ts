export const paginateResponse = (data: any, page: number, limit: number) => {
  const [result, total] = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    totalCount: total,
    prevPage,
    currentPage: page,
    nextPage,
    lastPage,
    result,
  };
};
