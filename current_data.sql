SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'ba4bf822-775f-4910-b1b3-bd1a88fdbaba', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"fiuza@bemcomum.org","user_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","user_phone":""}}', '2025-09-05 01:54:33.197658+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea091322-ab50-4e04-a2e8-2cf2da95e115', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 01:54:33.568461+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd8e1a62-94a8-4b16-8e99-ce125fa914be', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"labs@bemcomum.org","user_id":"f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c","user_phone":""}}', '2025-09-05 02:14:28.485954+00', ''),
	('00000000-0000-0000-0000-000000000000', '2dfebd97-0d9c-42f3-a2f6-5a353400ded0', '{"action":"login","actor_id":"f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c","actor_username":"labs@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 02:14:28.814468+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bbe00bf-32de-4112-8a11-ca2ef945bb54', '{"action":"login","actor_id":"f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c","actor_username":"labs@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 02:19:27.660178+00', ''),
	('00000000-0000-0000-0000-000000000000', '2843bc31-995a-4120-a2b4-d5b763628d81', '{"action":"token_refreshed","actor_id":"f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c","actor_username":"labs@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 10:45:21.333488+00', ''),
	('00000000-0000-0000-0000-000000000000', '7be8dabd-b3e5-479c-a5b4-8d557e31c8de', '{"action":"token_revoked","actor_id":"f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c","actor_username":"labs@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 10:45:21.349692+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a8341bf-0e67-4b19-97a4-25c986f55eb3', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 12:54:40.813259+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6369f95-c0c1-4d90-8d74-5e1ee3367540', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 13:47:40.793562+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d97669c-3f81-4e1b-8aef-95f5e5aa6d76', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 14:00:05.434003+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b259e915-7681-4d57-9f49-5239f71d6715', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@example.com","user_id":"8445a0bd-9c34-401a-ab5e-379c98455354","user_phone":""}}', '2025-09-05 14:56:21.329833+00', ''),
	('00000000-0000-0000-0000-000000000000', '197191d5-cc50-426e-add2-ace822d9352c', '{"action":"login","actor_id":"8445a0bd-9c34-401a-ab5e-379c98455354","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 14:56:37.121435+00', ''),
	('00000000-0000-0000-0000-000000000000', '11523310-3a6d-43a4-9881-a17e4426e653', '{"action":"login","actor_id":"8445a0bd-9c34-401a-ab5e-379c98455354","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 14:57:53.488734+00', ''),
	('00000000-0000-0000-0000-000000000000', '6238d773-f834-413a-b408-8f70732f8cc7', '{"action":"logout","actor_id":"8445a0bd-9c34-401a-ab5e-379c98455354","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-09-05 15:16:28.846756+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aee75bb6-aede-487d-9ff6-ec89267bbbcd', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 15:18:01.388243+00', ''),
	('00000000-0000-0000-0000-000000000000', '16d100a3-0bd8-4845-a04a-90bbb82d7825', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 15:22:17.927413+00', ''),
	('00000000-0000-0000-0000-000000000000', '894f066d-7b6c-4765-b638-5d4380727a18', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 15:33:07.710409+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c56e519e-ae4b-4973-92e1-1d62e508f004', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 16:42:39.275938+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7eda34a-0054-4e4b-9183-98d0446b1087', '{"action":"token_refreshed","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 18:22:03.999997+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e89bad0b-e93d-4dbd-a8e1-e8be270a8bc4', '{"action":"token_revoked","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 18:22:04.013304+00', ''),
	('00000000-0000-0000-0000-000000000000', '8606bdc0-abb5-41ad-85f3-8aed00221b12', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 18:31:29.080119+00', ''),
	('00000000-0000-0000-0000-000000000000', '21b9b833-62ec-4e89-acb2-510755b6dfbb', '{"action":"token_refreshed","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 19:37:09.240069+00', ''),
	('00000000-0000-0000-0000-000000000000', 'caf008af-cce3-48cf-85ac-dc9e4f09492a', '{"action":"token_revoked","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 19:37:09.256163+00', ''),
	('00000000-0000-0000-0000-000000000000', '1fe6973a-9e5d-43e4-9146-ed480a56761a', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 19:38:01.476121+00', ''),
	('00000000-0000-0000-0000-000000000000', '96d0fc60-c88c-44f4-8b2a-025b532a0591', '{"action":"logout","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account"}', '2025-09-05 20:14:21.497549+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e02e6eb5-acca-4f30-8bbd-ab0a762d4a31', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 20:15:20.248334+00', ''),
	('00000000-0000-0000-0000-000000000000', '209df34e-78be-4e8a-969a-e78b14e036e1', '{"action":"token_refreshed","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 21:18:37.476042+00', ''),
	('00000000-0000-0000-0000-000000000000', '77d9f17e-8978-465b-a734-7114900e4714', '{"action":"token_revoked","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-05 21:18:37.503521+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b336c60-890e-4597-92fc-9902d58d0ca7', '{"action":"logout","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account"}', '2025-09-05 21:20:18.946178+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad9fc56d-89c5-41ca-bff4-25ba42317ead', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"fiuzarosman@gmail.com","user_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","user_phone":""}}', '2025-09-05 21:21:01.446854+00', ''),
	('00000000-0000-0000-0000-000000000000', '806c12db-4b92-4be4-aa32-115457e0040a', '{"action":"login","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 21:21:01.770127+00', ''),
	('00000000-0000-0000-0000-000000000000', '189a44aa-8d77-43c3-9d74-1ded7827db3d', '{"action":"login","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-05 21:34:20.131317+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c6929cd-cd01-4371-89f3-9a2aa6e73e5e', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-05 22:42:14.156027+00', ''),
	('00000000-0000-0000-0000-000000000000', '50ac2615-7c39-48a6-acd1-97db86ceb2ed', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-05 22:42:14.163815+00', ''),
	('00000000-0000-0000-0000-000000000000', '8adae15b-2f29-45d3-8872-69138c28168a', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-05 23:40:50.884951+00', ''),
	('00000000-0000-0000-0000-000000000000', '952436ad-e4a7-4fae-931f-2a88ef0d075b', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-05 23:40:50.904197+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed08fffd-572e-4e16-a4a1-a329818c1eb9', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 18:26:59.874624+00', ''),
	('00000000-0000-0000-0000-000000000000', '05a03d39-b118-455c-9fb5-6e8cf3a67648', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 18:26:59.883772+00', ''),
	('00000000-0000-0000-0000-000000000000', '7db5ef9f-ccdd-49f2-bc3e-c787120a6d8d', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 21:24:04.056377+00', ''),
	('00000000-0000-0000-0000-000000000000', '603f1854-2557-465d-9234-4aad509fb12e', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 21:24:04.075117+00', ''),
	('00000000-0000-0000-0000-000000000000', '034dd87b-a153-4332-979d-ef4622b7b7b3', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-06 22:36:23.596385+00', ''),
	('00000000-0000-0000-0000-000000000000', '47fa06c5-965b-431f-8803-5ba01dc1c8b0', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 22:39:42.701696+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d67b086-1299-42e9-9418-2097f22e6cf8', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-06 22:39:42.703857+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b98392ef-3d66-423f-b44b-666dc1ef14dd', '{"action":"login","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-06 22:51:30.423109+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a4281901-ccc4-47e2-b82d-e83472132813', '{"action":"logout","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-09-06 23:13:04.284023+00', ''),
	('00000000-0000-0000-0000-000000000000', '3254e80a-a3a8-4a31-be1b-875ba6fb4f7e', '{"action":"login","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-06 23:13:37.979118+00', ''),
	('00000000-0000-0000-0000-000000000000', '362f3d4d-dcf9-4266-8daa-aa921fe010d3', '{"action":"token_refreshed","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-07 00:12:45.925155+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fab9eb0c-8524-4a59-b926-0ba1301f289a', '{"action":"token_revoked","actor_id":"3d62c43c-4879-4230-b43f-4ea12b5eef2e","actor_username":"fiuza@bemcomum.org","actor_via_sso":false,"log_type":"token"}', '2025-09-07 00:12:45.939947+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0cfb767-e9b5-49dc-bddb-fac3ed1d6d3b', '{"action":"token_refreshed","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 00:17:21.788931+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2492635-36d3-4137-9004-73811fed7ba2', '{"action":"token_revoked","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-09-07 00:17:21.790666+00', ''),
	('00000000-0000-0000-0000-000000000000', '54541ba7-ad17-4600-9ce1-e1df0c519f27', '{"action":"login","actor_id":"3e83ea7a-a73d-46b4-9197-bd4f543af997","actor_username":"fiuzarosman@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-07 00:34:01.855218+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', 'authenticated', 'authenticated', 'fiuza@bemcomum.org', '$2a$10$1WNtO8ScyVy3uC7K8yzceOltofwbnzHh.1NTKLosF7dejQsjJCeoC', '2025-09-05 01:54:33.20397+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-06 22:51:30.432575+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-05 01:54:33.176233+00', '2025-09-07 00:12:45.959515+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3e83ea7a-a73d-46b4-9197-bd4f543af997', 'authenticated', 'authenticated', 'fiuzarosman@gmail.com', '$2a$10$mkU2ZLdWd2csust6hoDJEeRkhv8EMss6DvjXCX9jYRAfB6c84M7VC', '2025-09-05 21:21:01.448283+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-07 00:34:01.861487+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-05 21:21:01.428322+00', '2025-09-07 00:34:01.888102+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', 'authenticated', 'authenticated', 'labs@bemcomum.org', '$2a$10$sNEOT/g.7XTIQpxyLvixIebtBUYqCmEz17DoJ/KvFhT9j685oIqJy', '2025-09-05 02:14:28.489809+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-05 02:19:27.661899+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-05 02:14:28.476287+00', '2025-09-05 10:45:21.36234+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8445a0bd-9c34-401a-ab5e-379c98455354', 'authenticated', 'authenticated', 'test@example.com', '$2a$10$KTmwpKQVXYVtSvZb0qJLG.cFldylJuX8B4ruei3cgGmzjABRFDCU.', '2025-09-05 14:56:21.346376+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-09-05 14:57:53.489455+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-05 14:56:21.305859+00', '2025-09-05 14:57:53.492101+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('3d62c43c-4879-4230-b43f-4ea12b5eef2e', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', '{"sub": "3d62c43c-4879-4230-b43f-4ea12b5eef2e", "email": "fiuza@bemcomum.org", "email_verified": false, "phone_verified": false}', 'email', '2025-09-05 01:54:33.195193+00', '2025-09-05 01:54:33.196392+00', '2025-09-05 01:54:33.196392+00', '384c4780-7a83-4472-a369-a501d5bb89c1'),
	('f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', '{"sub": "f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c", "email": "labs@bemcomum.org", "email_verified": false, "phone_verified": false}', 'email', '2025-09-05 02:14:28.484793+00', '2025-09-05 02:14:28.484855+00', '2025-09-05 02:14:28.484855+00', '5d60967c-3647-4e9b-be7d-71c6db0338c2'),
	('8445a0bd-9c34-401a-ab5e-379c98455354', '8445a0bd-9c34-401a-ab5e-379c98455354', '{"sub": "8445a0bd-9c34-401a-ab5e-379c98455354", "email": "test@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-05 14:56:21.326641+00', '2025-09-05 14:56:21.326708+00', '2025-09-05 14:56:21.326708+00', '80e7fc89-1f67-4049-888d-01a1071864d2'),
	('3e83ea7a-a73d-46b4-9197-bd4f543af997', '3e83ea7a-a73d-46b4-9197-bd4f543af997', '{"sub": "3e83ea7a-a73d-46b4-9197-bd4f543af997", "email": "fiuzarosman@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-05 21:21:01.441784+00', '2025-09-05 21:21:01.441852+00', '2025-09-05 21:21:01.441852+00', '7816ce3e-ece7-43be-8699-85a4c3d26f9b');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('2ee86308-425f-4632-b701-59514cd92e21', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', '2025-09-05 02:14:28.815484+00', '2025-09-05 02:14:28.815484+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '179.134.95.78', NULL),
	('1abe32d0-ac40-477a-b24e-c94cafb4e9d4', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', '2025-09-05 02:19:27.66198+00', '2025-09-05 10:45:21.371026+00', NULL, 'aal1', NULL, '2025-09-05 10:45:21.370938', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '179.134.95.78', NULL),
	('3aeab6b4-9acc-4271-b476-497f82456804', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', '2025-09-06 22:36:23.615242+00', '2025-09-06 22:36:23.615242+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '179.134.95.78', NULL),
	('873a58d4-7877-4bb3-baf8-b719cc7e923d', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', '2025-09-06 22:51:30.433308+00', '2025-09-07 00:12:45.966141+00', NULL, 'aal1', NULL, '2025-09-07 00:12:45.966017', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '179.134.95.78', NULL),
	('4d0d3d69-2b9d-4a46-a63c-3ad72538ff9e', '3e83ea7a-a73d-46b4-9197-bd4f543af997', '2025-09-06 23:13:37.990633+00', '2025-09-07 00:17:21.795815+00', NULL, 'aal1', NULL, '2025-09-07 00:17:21.795742', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '179.134.95.78', NULL),
	('d011827b-7ce9-4b8f-b2ec-826c9148cca6', '3e83ea7a-a73d-46b4-9197-bd4f543af997', '2025-09-07 00:34:01.861584+00', '2025-09-07 00:34:01.861584+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '179.134.95.78', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('2ee86308-425f-4632-b701-59514cd92e21', '2025-09-05 02:14:28.826692+00', '2025-09-05 02:14:28.826692+00', 'password', 'c77ad40b-8f5d-4737-965d-6852e373a0e2'),
	('1abe32d0-ac40-477a-b24e-c94cafb4e9d4', '2025-09-05 02:19:27.665983+00', '2025-09-05 02:19:27.665983+00', 'password', 'e8a26ba3-687e-434b-9868-582c46b7bc17'),
	('3aeab6b4-9acc-4271-b476-497f82456804', '2025-09-06 22:36:23.644224+00', '2025-09-06 22:36:23.644224+00', 'password', '59367304-1e26-4448-bfc3-7004ec3b48b6'),
	('873a58d4-7877-4bb3-baf8-b719cc7e923d', '2025-09-06 22:51:30.468061+00', '2025-09-06 22:51:30.468061+00', 'password', 'b92875d8-aba4-439d-9bbc-63042d59df5b'),
	('4d0d3d69-2b9d-4a46-a63c-3ad72538ff9e', '2025-09-06 23:13:38.006187+00', '2025-09-06 23:13:38.006187+00', 'password', '46eba525-48b0-44dc-8ee5-cd91fc4a7eeb'),
	('d011827b-7ce9-4b8f-b2ec-826c9148cca6', '2025-09-07 00:34:01.890645+00', '2025-09-07 00:34:01.890645+00', 'password', '9661dd2a-f599-4998-9d5d-5b22877d23d5');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 2, 'hs6vagiqbyoo', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', false, '2025-09-05 02:14:28.821412+00', '2025-09-05 02:14:28.821412+00', NULL, '2ee86308-425f-4632-b701-59514cd92e21'),
	('00000000-0000-0000-0000-000000000000', 3, 'a5txaygyz44c', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', true, '2025-09-05 02:19:27.663216+00', '2025-09-05 10:45:21.350837+00', NULL, '1abe32d0-ac40-477a-b24e-c94cafb4e9d4'),
	('00000000-0000-0000-0000-000000000000', 4, 'evzjiywjacjd', 'f4f32a4f-fc22-4eb0-a6f1-f0d43252f20c', false, '2025-09-05 10:45:21.357862+00', '2025-09-05 10:45:21.357862+00', 'a5txaygyz44c', '1abe32d0-ac40-477a-b24e-c94cafb4e9d4'),
	('00000000-0000-0000-0000-000000000000', 26, 's3sr57xa5rde', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', false, '2025-09-06 22:36:23.62882+00', '2025-09-06 22:36:23.62882+00', NULL, '3aeab6b4-9acc-4271-b476-497f82456804'),
	('00000000-0000-0000-0000-000000000000', 28, '4ancaccl2uvy', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', true, '2025-09-06 22:51:30.445519+00', '2025-09-07 00:12:45.94072+00', NULL, '873a58d4-7877-4bb3-baf8-b719cc7e923d'),
	('00000000-0000-0000-0000-000000000000', 30, 'vk5zj4no72l5', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', false, '2025-09-07 00:12:45.955395+00', '2025-09-07 00:12:45.955395+00', '4ancaccl2uvy', '873a58d4-7877-4bb3-baf8-b719cc7e923d'),
	('00000000-0000-0000-0000-000000000000', 29, 'obfj54sur4pb', '3e83ea7a-a73d-46b4-9197-bd4f543af997', true, '2025-09-06 23:13:37.996222+00', '2025-09-07 00:17:21.791269+00', NULL, '4d0d3d69-2b9d-4a46-a63c-3ad72538ff9e'),
	('00000000-0000-0000-0000-000000000000', 31, 'nqv5s7q5wexm', '3e83ea7a-a73d-46b4-9197-bd4f543af997', false, '2025-09-07 00:17:21.792605+00', '2025-09-07 00:17:21.792605+00', 'obfj54sur4pb', '4d0d3d69-2b9d-4a46-a63c-3ad72538ff9e'),
	('00000000-0000-0000-0000-000000000000', 32, 'qqiblnvbh4l2', '3e83ea7a-a73d-46b4-9197-bd4f543af997', false, '2025-09-07 00:34:01.877958+00', '2025-09-07 00:34:01.877958+00', NULL, 'd011827b-7ce9-4b8f-b2ec-826c9148cca6');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tenants" ("id", "nome_empresa", "cnpj", "email_empresa", "telefone", "endereco", "configuracoes", "plano", "status", "trial_ends_at", "subscription_id", "created_at", "updated_at", "deleted_at", "max_usuarios") VALUES
	('b486a714-e2cd-4bab-ba5b-a176869ff66f', 'Pedaço de Pão', NULL, 'fiuzarosman@gmail.com', NULL, '{}', '{}', 'free', 'trial', '2025-10-05 21:28:26.452707+00', NULL, '2025-09-05 21:28:26.452707+00', '2025-09-05 21:28:26.452707+00', NULL, 5),
	('deb87331-9f3e-4474-8a19-b0386a68b398', 'Familia Rio', NULL, 'fiuza@bemcomum.org', NULL, '{}', '{}', 'free', 'trial', '2025-10-06 22:36:36.769605+00', NULL, '2025-09-06 22:36:36.769605+00', '2025-09-06 22:36:36.769605+00', NULL, 5);


--
-- Data for Name: perfis; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."perfis" ("id", "tenant_id", "role", "nome_completo", "avatar_url", "configuracoes_pessoais", "preferencias_dashboard", "ultimo_acesso", "timezone", "locale", "status", "created_at", "updated_at", "deleted_at") VALUES
	('3e83ea7a-a73d-46b4-9197-bd4f543af997', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', 'admin_empresa', 'fiuzarosman', NULL, '{}', '{}', NULL, 'America/Sao_Paulo', 'pt_BR', 'active', '2025-09-05 21:28:26.452707+00', '2025-09-05 21:28:26.452707+00', NULL),
	('3d62c43c-4879-4230-b43f-4ea12b5eef2e', 'deb87331-9f3e-4474-8a19-b0386a68b398', 'admin_empresa', 'fiuza', NULL, '{}', '{}', NULL, 'America/Sao_Paulo', 'pt_BR', 'active', '2025-09-06 22:36:36.769605+00', '2025-09-06 22:36:36.769605+00', NULL);


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audit_log" ("id", "tenant_id", "user_id", "modulo", "acao", "entidade", "entidade_id", "detalhes", "dados_antigos", "dados_novos", "ip_address", "user_agent", "sessao_id", "nivel", "created_at") VALUES
	('92047356-ae0e-4f63-8489-2c420174d22a', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '3e83ea7a-a73d-46b4-9197-bd4f543af997', NULL, 'CREATE', 'tenant', NULL, '{"trial_ends": "2025-10-05T21:28:26.452707+00:00", "tenant_name": "Pedaço de Pão"}', NULL, NULL, NULL, NULL, NULL, 'info', '2025-09-05 21:28:26.452707+00'),
	('cd8b8ec8-b20e-4696-8227-9c2343ee1226', 'deb87331-9f3e-4474-8a19-b0386a68b398', '3d62c43c-4879-4230-b43f-4ea12b5eef2e', NULL, 'CREATE', 'tenant', NULL, '{"trial_ends": "2025-10-06T22:36:36.769605+00:00", "tenant_name": "Familia Rio"}', NULL, NULL, NULL, NULL, NULL, 'info', '2025-09-06 22:36:36.769605+00');


--
-- Data for Name: convites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: kv_store_d3150113; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."modulos" ("id", "nome", "slug", "descricao", "descricao_longa", "icone_url", "screenshots", "link_destino", "is_free", "preco_mensal", "categoria", "tags", "versao", "status", "manifest", "requisitos_minimos", "desenvolvedor", "site_desenvolvedor", "suporte_email", "avaliacao_media", "total_instalacoes", "created_at", "updated_at") VALUES
	('950d2e31-909d-42af-be1e-a62fb5d8a704', 'CRM Básico', 'crm-basico', 'Gestão básica de contatos e leads', 'Sistema completo para gerenciar seus contatos, leads e oportunidades de venda. Inclui pipeline visual, 
  histórico de interações e relatórios básicos.', NULL, NULL, 'https://crm.hubapp.com.br', true, NULL, 'produtividade', NULL, '1.0.0', 'active', '{"icon": "Users", "version": "1.0.0", "icone_lucide": "Users"}', '{}', 'Hub.App Team', NULL, NULL, 4.8, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('9889c68c-023a-4065-a62f-ca6275335aa7', 'Agenda', 'agenda', 'Calendário e agendamentos', 'Organize seus compromissos, agende reuniões e sincronize com Google Calendar. Perfeito para 
  profissionais e equipes.', NULL, NULL, 'https://agenda.hubapp.com.br', true, NULL, 'produtividade', NULL, '1.0.0', 'active', '{"icon": "Calendar", "version": "1.0.0", "icone_lucide": "Calendar"}', '{}', 'Hub.App Team', NULL, NULL, 4.6, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('1a7ade07-e718-4500-b3a6-6b674b6cca94', 'Financeiro Pro', 'financeiro-pro', 'Gestão financeira completa', 'Controle total das finanças da sua empresa: fluxo de caixa, contas a pagar/receber, relatórios 
  gerenciais e muito mais.', NULL, NULL, 'https://financeiro.hubapp.com.br', false, 29.90, 'financeiro', NULL, '1.0.0', 'active', '{"icon": "DollarSign", "version": "2.1.0", "icone_lucide": "DollarSign"}', '{}', 'Hub.App Team', NULL, NULL, 4.9, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('f7956e14-8bd3-4a83-b0c0-6e97384a064b', 'E-commerce', 'ecommerce', 'Loja online integrada', 'Crie sua loja online completa com catálogo de produtos, carrinho de compras, pagamentos online e gestão
   de pedidos.', NULL, NULL, 'https://loja.hubapp.com.br', false, 49.90, 'vendas', NULL, '1.0.0', 'active', '{"icon": "ShoppingCart", "version": "1.5.0", "icone_lucide": "ShoppingCart"}', '{}', 'Hub.App Team', NULL, NULL, 4.7, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('1de93962-14a1-4ecc-8dff-aca01088ea3e', 'Recursos Humanos', 'recursos-humanos', 'Gestão completa de RH', 'Controle de funcionários, folha de pagamento, ponto eletrônico, férias, benefícios e muito mais.', NULL, NULL, 'https://rh.hubapp.com.br', false, 39.90, 'recursos_humanos', NULL, '1.0.0', 'active', '{"icon": "UserCheck", "version": "1.3.0", "icone_lucide": "UserCheck"}', '{}', 'Hub.App Team', NULL, NULL, 4.5, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('00ee1d7d-6521-41e2-ac89-0c1106a87579', 'Estoque Inteligente', 'estoque-inteligente', 'Controle de estoque avançado', 'Gerencie seu estoque com códigos de barras, alertas de baixo estoque, relatórios de giro e análises de 
  demanda.', NULL, NULL, 'https://estoque.hubapp.com.br', false, 24.90, 'produtividade', NULL, '1.0.0', 'active', '{"icon": "Package", "version": "1.2.0", "icone_lucide": "Package"}', '{}', 'Hub.App Team', NULL, NULL, 4.8, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('996c59b7-a62b-48a5-b1c7-c64412982215', 'Marketing Digital', 'marketing-digital', 'Automação de marketing', 'Email marketing, automação de campanhas, landing pages e análise de resultados. Tudo integrado.', NULL, NULL, 'https://marketing.hubapp.com.br', false, 34.90, 'marketing', NULL, '1.0.0', 'active', '{"icon": "Megaphone", "version": "1.4.0", "icone_lucide": "Megaphone"}', '{}', 'Hub.App Team', NULL, NULL, 4.6, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00'),
	('d1c344be-1a12-4b7b-bb27-43913fa8dfde', 'Suporte ao Cliente', 'suporte-cliente', 'Central de atendimento', 'Sistema completo de tickets, chat online, base de conhecimento e relatórios de satisfação.', NULL, NULL, 'https://suporte.hubapp.com.br', false, 19.90, 'comunicacao', NULL, '1.0.0', 'active', '{"icon": "MessageCircle", "version": "1.1.0", "icone_lucide": "MessageCircle"}', '{}', 'Hub.App Team', NULL, NULL, 4.4, 0, '2025-09-05 20:07:51.029554+00', '2025-09-05 20:07:51.029554+00');


--
-- Data for Name: module_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notificacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: permissoes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: perfil_permissoes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tenants_modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tenants_modulos" ("id", "tenant_id", "modulo_id", "data_instalacao", "data_expiracao", "configuracoes", "status", "subscription_item_id", "created_at", "updated_at") VALUES
	('f69a0be9-0b86-4ce2-860c-326058894202', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '00ee1d7d-6521-41e2-ac89-0c1106a87579', '2025-09-06 23:10:44.93+00', NULL, '{}', 'active', NULL, '2025-09-06 23:10:45.110918+00', '2025-09-06 23:10:45.110918+00'),
	('ba813fa2-2140-4fac-bbce-04d583a14d72', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '1a7ade07-e718-4500-b3a6-6b674b6cca94', '2025-09-06 23:10:56.578+00', NULL, '{}', 'active', NULL, '2025-09-06 23:10:56.727918+00', '2025-09-06 23:10:56.727918+00'),
	('09286ae9-801b-425e-8120-3922f11322a3', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '996c59b7-a62b-48a5-b1c7-c64412982215', '2025-09-06 23:11:00.194+00', NULL, '{}', 'active', NULL, '2025-09-06 23:11:00.334423+00', '2025-09-06 23:11:00.334423+00'),
	('5d70c5ad-d04e-4607-bf32-e75771076042', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', 'f7956e14-8bd3-4a83-b0c0-6e97384a064b', '2025-09-06 23:11:02.944+00', NULL, '{}', 'active', NULL, '2025-09-06 23:11:03.101476+00', '2025-09-06 23:11:03.101476+00'),
	('88754023-8244-45ff-9ce9-7ed65adda0ab', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '1de93962-14a1-4ecc-8dff-aca01088ea3e', '2025-09-06 23:11:05.495+00', NULL, '{}', 'active', NULL, '2025-09-06 23:11:05.633845+00', '2025-09-06 23:11:05.633845+00'),
	('10e96cc9-1212-44a7-b690-74ce6d91cd40', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', 'd1c344be-1a12-4b7b-bb27-43913fa8dfde', '2025-09-06 23:11:07.727+00', NULL, '{}', 'active', NULL, '2025-09-06 23:11:07.872269+00', '2025-09-06 23:11:07.872269+00'),
	('fe879dfe-6e89-494c-83e5-ea04f776678c', 'deb87331-9f3e-4474-8a19-b0386a68b398', '950d2e31-909d-42af-be1e-a62fb5d8a704', '2025-09-07 00:17:58.257+00', NULL, '{}', 'active', NULL, '2025-09-07 00:17:58.317859+00', '2025-09-07 00:17:58.317859+00'),
	('6f52ee41-ae0f-4bd8-8003-53c47763a327', 'deb87331-9f3e-4474-8a19-b0386a68b398', 'f7956e14-8bd3-4a83-b0c0-6e97384a064b', '2025-09-07 00:26:45.217+00', NULL, '{}', 'active', NULL, '2025-09-07 00:26:45.336383+00', '2025-09-07 00:26:45.336383+00'),
	('d5e5bfdd-4d1a-48e4-8ab9-164e512b2ef4', 'deb87331-9f3e-4474-8a19-b0386a68b398', '1a7ade07-e718-4500-b3a6-6b674b6cca94', '2025-09-07 00:27:27.451+00', NULL, '{}', 'active', NULL, '2025-09-07 00:27:27.559031+00', '2025-09-07 00:27:27.559031+00'),
	('75646b44-62f5-4ce2-bdb2-06067b2c2e36', 'deb87331-9f3e-4474-8a19-b0386a68b398', '00ee1d7d-6521-41e2-ac89-0c1106a87579', '2025-09-07 00:29:59.171+00', NULL, '{}', 'active', NULL, '2025-09-07 00:29:59.271819+00', '2025-09-07 00:29:59.271819+00'),
	('63212895-f9db-4837-aa47-9ba2f030c6b2', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '950d2e31-909d-42af-be1e-a62fb5d8a704', '2025-09-07 00:31:58.173+00', NULL, '{}', 'active', NULL, '2025-09-07 00:31:58.233129+00', '2025-09-07 00:31:58.233129+00'),
	('c13f82a8-1e88-4e1f-a708-6d95e323cf2f', 'b486a714-e2cd-4bab-ba5b-a176869ff66f', '9889c68c-023a-4065-a62f-ca6275335aa7', '2025-09-07 00:32:00.429+00', NULL, '{}', 'active', NULL, '2025-09-07 00:32:00.467269+00', '2025-09-07 00:32:00.467269+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 35, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
