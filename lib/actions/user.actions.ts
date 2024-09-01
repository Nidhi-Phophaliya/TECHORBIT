import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";