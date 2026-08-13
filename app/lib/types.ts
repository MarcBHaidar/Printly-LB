export type GalleryImage={id?:number;image_url:string;caption?:string|null;sort_order?:number};
export type ProjectItem={
  id:number; title:string; category:string; description:string; image_url:string;
  slug?:string; featured?:boolean; filter_category?:string|null;
  customer_goal?:string|null; solution?:string|null; materials?:string|null;
  finishing?:string|null; final_result?:string|null; gallery?:GalleryImage[];
};
export type Testimonial={id:number;client_name:string;client_role:string|null;quote:string;logo_url:string|null;visible?:boolean};
