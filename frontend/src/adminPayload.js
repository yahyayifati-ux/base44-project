/* Maps an API property payload back into the shape the backend accepts, so the
   list view can toggle publication without refetching every field by hand. */

export function toPropertyPayload(property) {
  return {
    title_fa: property.title_fa ?? '',
    slug: property.slug ?? null,
    description_fa: property.description_fa ?? '',
    category_slug: property.category?.slug ?? property.category_slug ?? null,
    transaction_type: property.transaction_type ?? 'sale',
    province: property.province ?? 'هرمزگان',
    city: property.city ?? 'قشم',
    neighborhood: property.neighborhood ?? '',
    location_note: property.location_note ?? '',
    area_sqm: property.area_sqm ?? null,
    land_area_sqm: property.land_area_sqm ?? null,
    rooms: property.rooms ?? null,
    floor: property.floor ?? null,
    year_built: property.year_built ?? null,
    documentation: property.documentation ?? '',
    price: property.price ?? null,
    price_on_request: Boolean(property.price_on_request),
    deposit: property.deposit ?? null,
    monthly_rent: property.monthly_rent ?? null,
    features: property.features ?? [],
    images: property.images ?? [],
    featured_image: property.featured_image ?? '',
    floor_plan_url: property.floor_plan_url ?? '',
    video_url: property.video_url ?? '',
    virtual_tour_url: property.virtual_tour_url ?? '',
    latitude: property.latitude ?? '',
    longitude: property.longitude ?? '',
    published: Boolean(property.published),
    featured: Boolean(property.featured),
  }
}

export function numOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null
}
